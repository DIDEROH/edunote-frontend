// Vérifie et exécute une fonction de manière sécurisée
export default function handleClick(f) {
    if (typeof f === 'function') {
        f();
    }
}