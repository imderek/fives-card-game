// Parse JSON safely using a utility function
export const safeParseJSON = (data, dataType) => {
    try {
        return JSON.parse(data);
    } catch {
        console.error(`Invalid JSON in ${dataType}:`, data);
        return null;
    }
};