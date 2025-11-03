// ethiopianCalendar.ts - Ethiopian calendar utilities
const ETHIOPIAN_MONTHS = [
    'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

// Convert Gregorian date to Ethiopian calendar
export const gregorianToEthiopian = (gregorianDate: Date) => {
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth() + 1;
    const day = gregorianDate.getDate();

    // Ethiopian calendar starts on September 11 (or 12 in leap years)
    // Calculate days since Ethiopian New Year
    const ethiopianNewYear = new Date(year, 8, 11); // September 11

    // If we're before Ethiopian New Year, use previous Ethiopian year
    let ethYear = year - 7;
    let dayOfYear: number;

    if (gregorianDate < ethiopianNewYear) {
        ethYear = year - 8;
        const prevEthiopianNewYear = new Date(year - 1, 8, 11);
        dayOfYear = Math.floor((gregorianDate.getTime() - prevEthiopianNewYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
        dayOfYear = Math.floor((gregorianDate.getTime() - ethiopianNewYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate Ethiopian month and day
    let ethMonth: number;
    let ethDay: number;

    if (dayOfYear <= 360) {
        // First 12 months (30 days each)
        ethMonth = Math.ceil(dayOfYear / 30);
        ethDay = dayOfYear - ((ethMonth - 1) * 30);
    } else {
        // 13th month (Pagumen)
        ethMonth = 13;
        ethDay = dayOfYear - 360;
    }

    return { year: ethYear, month: ethMonth, day: ethDay };
};

// Convert Ethiopian date to Gregorian
export const ethiopianToGregorian = (ethYear: number, ethMonth: number, ethDay: number) => {
    // Validate Ethiopian date
    if (ethMonth < 1 || ethMonth > 13) {
        throw new Error('Invalid Ethiopian month');
    }
    if (ethDay < 1 || (ethMonth <= 12 && ethDay > 30) || (ethMonth === 13 && ethDay > 6)) {
        throw new Error('Invalid Ethiopian day');
    }

    // Calculate total days from Ethiopian New Year
    let totalDays = 0;

    // Add days from complete months
    for (let month = 1; month < ethMonth; month++) {
        totalDays += month <= 12 ? 30 : 6; // First 12 months have 30 days, Pagumen has 6
    }

    // Add days from current month
    totalDays += ethDay - 1; // -1 because we start from day 0

    // Ethiopian New Year starts on September 11 (Gregorian)
    const gregorianYear = ethYear + 7;
    const ethiopianNewYear = new Date(gregorianYear, 8, 11); // September 11

    // Add the calculated days to Ethiopian New Year
    const resultDate = new Date(ethiopianNewYear);
    resultDate.setDate(resultDate.getDate() + totalDays);

    return resultDate;
};

// Format Ethiopian date for display
export const formatEthiopianDate = (gregorianDate: Date) => {
    const ethDate = gregorianToEthiopian(gregorianDate);
    const monthName = ETHIOPIAN_MONTHS[ethDate.month - 1] || ETHIOPIAN_MONTHS[0];

    // Format time in Ethiopian time system (6 hours ahead)
    const hours = gregorianDate.getHours();
    const minutes = gregorianDate.getMinutes();

    // Convert to Ethiopian time (add 6 hours, then adjust for 12-hour format)
    let ethiopianHour = (hours + 6) % 24;
    const isDay = ethiopianHour >= 0 && ethiopianHour < 12; // Day: 6AM-6PM, Night: 6PM-6AM

    // Convert to 12-hour format for display
    const displayHours = (ethiopianHour % 12) || 12;
    const timeIndicator = isDay ? 'ቀን' : 'ሌሊት'; // 'day' : 'night'
    const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${timeIndicator}`;

    return `${ethDate.day} ${monthName} ${ethDate.year}፣ ${timeString}`;
};

export { ETHIOPIAN_MONTHS };