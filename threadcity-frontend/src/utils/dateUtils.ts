export const formatDate = (date: Date, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes('YYYY')) {
        options.year = 'numeric';
    }
    if (format.includes('MM')) {
        options.month = '2-digit';
    }
    if (format.includes('DD')) {
        options.day = '2-digit';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};