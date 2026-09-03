import { useState, useEffect } from 'react';

export const useDocumentTitle = (initialTitle: string) => {
    const [title, setTitle] = useState(initialTitle);

    useEffect(() => {
        document.title = title;
    }, [title])

    return [title, setTitle] as const;
}