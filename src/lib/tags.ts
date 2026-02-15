export function generateTags(filename: string): string[] {
    const tags: string[] = [];
    const lowerName = filename.toLowerCase();

    // 1. Subject Detection
    const subjects = [
        'science', 'math', 'history', 'english', 'sinhala',
        'physics', 'chemistry', 'biology', 'ict', 'commerce', 'art'
    ];

    subjects.forEach(subject => {
        if (lowerName.includes(subject)) {
            // Capitalize first letter
            tags.push(subject.charAt(0).toUpperCase() + subject.slice(1));
        }
    });

    // 2. Year Detection (2020 - 2030)
    const yearMatch = filename.match(/202[0-9]/);
    if (yearMatch) {
        tags.push(yearMatch[0]);
    }

    // 3. Type Detection
    if (lowerName.includes('paper') || lowerName.includes('exam')) tags.push('Exam Paper');
    if (lowerName.includes('assignment') || lowerName.includes('hw')) tags.push('Assignment');
    if (lowerName.includes('note') || lowerName.includes('short')) tags.push('Notes');
    if (lowerName.includes('recording') || lowerName.includes('zoom')) tags.push('Recording');

    return tags;
}
