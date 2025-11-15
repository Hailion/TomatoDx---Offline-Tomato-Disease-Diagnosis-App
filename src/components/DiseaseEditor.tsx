// src/components/DiseaseEditor.tsx - Disease Editor Component
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getAllDiseases, getDiseaseById, upsertDisease } from '../db/repository';

interface DiseaseEditorProps {
    visible: boolean;
    onClose: () => void;
}

export default function DiseaseEditor({ visible, onClose }: DiseaseEditorProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [diseases, setDiseases] = useState<{ diseaseId: string; nameEn?: string; nameAm?: string; symptoms?: string; advice?: string }[]>([]);
    const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
    const [nameEn, setNameEn] = useState('');
    const [nameAm, setNameAm] = useState('');
    const [symptomsEn, setSymptomsEn] = useState('');
    const [symptomsAm, setSymptomsAm] = useState('');
    const [treatmentImmediateEn, setTreatmentImmediateEn] = useState('');
    const [treatmentImmediateAm, setTreatmentImmediateAm] = useState('');
    const [treatmentLongTermEn, setTreatmentLongTermEn] = useState('');
    const [treatmentLongTermAm, setTreatmentLongTermAm] = useState('');
    const [preventionEn, setPreventionEn] = useState('');
    const [preventionAm, setPreventionAm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadDiseases();
        }
    }, [visible]);

    const loadDiseases = () => {
        try {
            const allDiseases = getAllDiseases();
            setDiseases(allDiseases);
        } catch (error) {
            console.error('Error loading diseases:', error);
            Alert.alert('Error', 'Failed to load diseases');
        }
    };

    // Helper function to extract language-specific content from JSON or plain text
    const getLocalizedValue = (content: string | null | undefined, lang: 'en' | 'am'): string => {
        if (!content || !content.trim()) return '';
        try {
            const parsed = JSON.parse(content);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed[lang] || parsed.en || parsed.am || '';
            }
        } catch {
            // Not JSON, return as plain text (backward compatibility)
            // If it's plain text and we're asking for English, return it
            // If asking for Amharic and it's plain text, return empty (likely English)
            if (lang === 'en') return content;
        }
        return '';
    };

    // Helper function to extract structured advice data
    const getStructuredAdvice = (content: string | null | undefined, lang: 'en' | 'am', field: 'treatmentImmediate' | 'treatmentLongTerm' | 'prevention'): string => {
        if (!content || !content.trim()) return '';
        try {
            const parsed = JSON.parse(content);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                // Check if it's a language object (e.g., {"en": {...}, "am": {...}})
                if (parsed[lang] && typeof parsed[lang] === 'object') {
                    return parsed[lang][field] || parsed[lang][field === 'treatmentImmediate' ? 'immediate' : field === 'treatmentLongTerm' ? 'longTerm' : 'prevention'] || '';
                }
                // Direct structured data (backward compatibility)
                if (parsed[field]) return parsed[field];
                if (parsed[field === 'treatmentImmediate' ? 'immediate' : field === 'treatmentLongTerm' ? 'longTerm' : 'prevention']) {
                    return parsed[field === 'treatmentImmediate' ? 'immediate' : field === 'treatmentLongTerm' ? 'longTerm' : 'prevention'];
                }
            }
        } catch {
            // Not JSON, return empty (old format doesn't have structured data)
        }
        return '';
    };

    const handleSelectDisease = (diseaseId: string) => {
        const disease = getDiseaseById(diseaseId);
        if (disease) {
            setSelectedDisease(diseaseId);
            setNameEn(disease.nameEn || '');
            setNameAm(disease.nameAm || '');
            setSymptomsEn(getLocalizedValue(disease.symptoms, 'en'));
            setSymptomsAm(getLocalizedValue(disease.symptoms, 'am'));
            setTreatmentImmediateEn(getStructuredAdvice(disease.advice, 'en', 'treatmentImmediate'));
            setTreatmentImmediateAm(getStructuredAdvice(disease.advice, 'am', 'treatmentImmediate'));
            setTreatmentLongTermEn(getStructuredAdvice(disease.advice, 'en', 'treatmentLongTerm'));
            setTreatmentLongTermAm(getStructuredAdvice(disease.advice, 'am', 'treatmentLongTerm'));
            setPreventionEn(getStructuredAdvice(disease.advice, 'en', 'prevention'));
            setPreventionAm(getStructuredAdvice(disease.advice, 'am', 'prevention'));
        }
    };

    const handleSave = () => {
        if (!selectedDisease) {
            Alert.alert('Error', 'Please select a disease first');
            return;
        }

        setLoading(true);
        try {
            // Build JSON objects for symptoms with language support
            const symptomsData: { en?: string; am?: string } = {};
            if (symptomsEn.trim()) symptomsData.en = symptomsEn.trim();
            if (symptomsAm.trim()) symptomsData.am = symptomsAm.trim();
            const symptomsJson = Object.keys(symptomsData).length > 0 ? JSON.stringify(symptomsData) : undefined;

            // Build structured JSON for advice with language support
            // Format: {"en": {"treatmentImmediate": "...", "treatmentLongTerm": "...", "prevention": "..."}, "am": {...}}
            const adviceData: { en?: { treatmentImmediate?: string; treatmentLongTerm?: string; prevention?: string }; am?: { treatmentImmediate?: string; treatmentLongTerm?: string; prevention?: string } } = {};
            
            if (treatmentImmediateEn.trim() || treatmentLongTermEn.trim() || preventionEn.trim()) {
                adviceData.en = {};
                if (treatmentImmediateEn.trim()) adviceData.en.treatmentImmediate = treatmentImmediateEn.trim();
                if (treatmentLongTermEn.trim()) adviceData.en.treatmentLongTerm = treatmentLongTermEn.trim();
                if (preventionEn.trim()) adviceData.en.prevention = preventionEn.trim();
            }
            
            if (treatmentImmediateAm.trim() || treatmentLongTermAm.trim() || preventionAm.trim()) {
                adviceData.am = {};
                if (treatmentImmediateAm.trim()) adviceData.am.treatmentImmediate = treatmentImmediateAm.trim();
                if (treatmentLongTermAm.trim()) adviceData.am.treatmentLongTerm = treatmentLongTermAm.trim();
                if (preventionAm.trim()) adviceData.am.prevention = preventionAm.trim();
            }
            
            const adviceJson = Object.keys(adviceData).length > 0 ? JSON.stringify(adviceData) : undefined;

            upsertDisease(
                selectedDisease,
                nameEn || undefined,
                nameAm || undefined,
                symptomsJson,
                adviceJson
            );
            Alert.alert('Success', 'Disease updated successfully');
            loadDiseases();
            handleCancel();
        } catch (error) {
            console.error('Error saving disease:', error);
            Alert.alert('Error', 'Failed to save disease');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedDisease(null);
        setNameEn('');
        setNameAm('');
        setSymptomsEn('');
        setSymptomsAm('');
        setTreatmentImmediateEn('');
        setTreatmentImmediateAm('');
        setTreatmentLongTermEn('');
        setTreatmentLongTermAm('');
        setPreventionEn('');
        setPreventionAm('');
    };

    if (!visible) return null;

    return (
  <KeyboardAvoidingView
    style={[styles.container, { backgroundColor: colors.background }]}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={80}  // tune if header overlaps
  >
    <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Edit Diseases</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Disease</Text>
                        {diseases.map((disease) => (
                            <TouchableOpacity
                                key={disease.diseaseId}
                                style={[
                                    styles.diseaseCard,
                                    { backgroundColor: colors.card },
                                    selectedDisease === disease.diseaseId && { borderColor: colors.primary, borderWidth: 2 },
                                ]}
                                onPress={() => handleSelectDisease(disease.diseaseId)}
                            >
                                <Text style={[styles.diseaseId, { color: colors.text }]}>{disease.diseaseId}</Text>
                                {disease.nameEn && (
                                    <Text style={[styles.diseaseName, { color: colors.textSecondary }]}>{disease.nameEn}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedDisease && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Disease Information</Text>
                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Disease ID</Text>
                                <Text style={[styles.diseaseIdDisplay, { color: colors.textSecondary }]}>{selectedDisease}</Text>
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Name (English)</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={nameEn}
                                    onChangeText={setNameEn}
                                    placeholder="Enter English name"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Name (Amharic)</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={nameAm}
                                    onChangeText={setNameAm}
                                    placeholder="Enter Amharic name"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Symptoms (English)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={symptomsEn}
                                    onChangeText={setSymptomsEn}
                                    placeholder="Enter symptoms in English (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Symptoms (Amharic)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={symptomsAm}
                                    onChangeText={setSymptomsAm}
                                    placeholder="Enter symptoms in Amharic (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Immediate Treatment (English)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={treatmentImmediateEn}
                                    onChangeText={setTreatmentImmediateEn}
                                    placeholder="Enter immediate treatment actions in English (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Immediate Treatment (Amharic)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={treatmentImmediateAm}
                                    onChangeText={setTreatmentImmediateAm}
                                    placeholder="Enter immediate treatment actions in Amharic (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Long-term Treatment (English)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={treatmentLongTermEn}
                                    onChangeText={setTreatmentLongTermEn}
                                    placeholder="Enter long-term treatment actions in English (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Long-term Treatment (Amharic)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={treatmentLongTermAm}
                                    onChangeText={setTreatmentLongTermAm}
                                    placeholder="Enter long-term treatment actions in Amharic (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Prevention/Tips (English)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={preventionEn}
                                    onChangeText={setPreventionEn}
                                    placeholder="Enter prevention tips in English (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={[styles.formGroup, { backgroundColor: colors.card }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Prevention/Tips (Amharic)</Text>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                                    value={preventionAm}
                                    onChangeText={setPreventionAm}
                                    placeholder="Enter prevention tips in Amharic (one per line or comma-separated)"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, { backgroundColor: colors.backgroundAlt }]}
                                    onPress={handleCancel}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    diseaseCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    diseaseId: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    diseaseName: {
        fontSize: 14,
    },
    formGroup: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    diseaseIdDisplay: {
        fontSize: 14,
        fontFamily: 'monospace',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {},
    saveButton: {},
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

