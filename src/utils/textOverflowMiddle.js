export default function textOverflowMiddle(text = '', max=10) {
    const middle = Math.round(max/2);
    if (text.length > max) {
        const firstPart = text.substring(0, middle);
        const secondPart = text.substring(text.length - middle, text.length);
        return firstPart + '...' + secondPart;
    } else return text;
}