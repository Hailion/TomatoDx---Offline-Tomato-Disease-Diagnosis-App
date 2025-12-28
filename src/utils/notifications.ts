import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import i18next from 'i18next';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
    let isGranted = false;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice || true) { // Allow on simulator for testing logic (though push fails, local works)
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        isGranted = finalStatus === 'granted';
    } else {
    }

    return isGranted;
}

export async function scheduleDailyReminder() {
    // Cancel existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for 9:00 AM every day
    const trigger: any = {
        type: 'daily',
        hour: 9,
        minute: 0,
        repeats: true,
    };


    await Notifications.scheduleNotificationAsync({
        content: {
            title: i18next.t('profile.notification.title'),
            body: i18next.t('profile.notification.body'),
            sound: true,
        },
        trigger,
    });
}

export async function cancelNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getNotificationStatus(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return status === 'granted' && scheduled.length > 0;
}
