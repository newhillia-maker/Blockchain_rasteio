import { shortenHash } from "~/lib/hash";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";

interface HashDisplayProps {
    hash: string;
    short?: boolean;
    copyable?: boolean;
}

export function HashDisplay({ hash, short = true, copyable = true }: HashDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="inline-flex items-center gap-2">
            <code className="hash-display">
                {short ? shortenHash(hash) : hash}
            </code>
            {copyable && (
                <button className="btn-icon" onClick={handleCopy} title="Copiar hash">
                    {copied ? <FiCheck size={14} style={{ color: "var(--color-success)" }} /> : <FiCopy size={14} />}
                </button>
            )}
        </div>
    );
}
