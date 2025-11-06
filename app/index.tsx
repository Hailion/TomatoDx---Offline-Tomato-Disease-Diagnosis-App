import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
    const router = useRouter();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkOnboardingStatus() {
            try {
                const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
                setHasCompletedOnboarding(completed === 'true');
            } catch {
                setHasCompletedOnboarding(false);
            }
        }

        checkOnboardingStatus();
    }, []);

    useEffect(() => {
        if (hasCompletedOnboarding === null) return;

        const timer = setTimeout(() => {
            if (hasCompletedOnboarding) {
                router.replace('/tomatodx');
            } else {
                router.replace('/onboarding');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [hasCompletedOnboarding, router]);

    return null;
}