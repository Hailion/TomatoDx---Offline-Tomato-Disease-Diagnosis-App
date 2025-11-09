import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import PrivacyModal from '../src/components/PrivacyModal';

// AsyncStorage keys
const PRIVACY_CONSENT_KEY = '@tomatodx_privacy_consent';
const RESEARCH_OPT_IN_KEY = '@tomatodx_research_opt_in';

export default function Index() {
    const router = useRouter();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [hasGivenPrivacyConsent, setHasGivenPrivacyConsent] = useState<boolean | null>(null);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [researchOptIn, setResearchOptIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAppStatus();
    }, []);

    const checkAppStatus = async () => {
        try {
            const [onboardingCompleted, privacyConsent, researchOptInValue] = await Promise.all([
                AsyncStorage.getItem('hasCompletedOnboarding'),
                AsyncStorage.getItem(PRIVACY_CONSENT_KEY),
                AsyncStorage.getItem(RESEARCH_OPT_IN_KEY)
            ]);

            setHasCompletedOnboarding(onboardingCompleted === 'true');
            setHasGivenPrivacyConsent(privacyConsent !== null);
            setResearchOptIn(researchOptInValue === 'true');
        } catch (error) {
            console.error('Error checking app status:', error);
            setHasCompletedOnboarding(false);
            setHasGivenPrivacyConsent(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading || hasCompletedOnboarding === null || hasGivenPrivacyConsent === null) {
            return;
        }

        const timer = setTimeout(() => {
            if (!hasCompletedOnboarding) {
                // First time user - go to onboarding
                router.replace('/onboarding');
            } else if (!hasGivenPrivacyConsent) {
                // Onboarding done but no privacy consent - show privacy modal
                setShowPrivacyModal(true);
            } else {
                // Everything completed - go to main app
                router.replace('/tomatodx');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [hasCompletedOnboarding, hasGivenPrivacyConsent, isLoading, router]);

    const handlePrivacyModalClose = async (accepted: boolean) => {
        try {
            if (accepted) {
                // Save privacy consent
                await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, 'true');
                await AsyncStorage.setItem(RESEARCH_OPT_IN_KEY, researchOptIn.toString());

                console.log('Privacy consent saved:', {
                    consented: true,
                    researchOptIn: researchOptIn
                });
            } else {
                // User declined - still save that they made a choice
                await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, 'false');
                await AsyncStorage.setItem(RESEARCH_OPT_IN_KEY, 'false');

                console.log('Privacy consent declined');
            }

            setShowPrivacyModal(false);

            // Navigate to main app after privacy choice
            setTimeout(() => {
                router.replace('/tomatodx');
            }, 300);
        } catch (error) {
            console.error('Failed to save privacy settings:', error);
            setShowPrivacyModal(false);
            router.replace('/tomatodx');
        }
    };

    const handleResearchOptInToggle = (value: boolean) => {
        setResearchOptIn(value);
    };

    // Show privacy modal if needed
    if (showPrivacyModal) {
        return (
            <PrivacyModal
                visible={showPrivacyModal}
                onClose={handlePrivacyModalClose}
                onToggle={handleResearchOptInToggle}
                optIn={researchOptIn}
            />
        );
    }

    return null;
}