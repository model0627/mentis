export const Heroes = () => {
    return (
        <div className="flex flex-col items-center justify-center max-w-5xl">
            <div className="flex items-center gap-x-8">
                {/* Documents illustration */}
                <div className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[350px] md:w-[400px] flex items-center justify-center">
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        {/* Background glow */}
                        <circle cx="200" cy="200" r="140" className="fill-primary/5" />
                        {/* Document stack */}
                        <rect x="120" y="100" width="180" height="220" rx="12" className="fill-background stroke-border" strokeWidth="2" />
                        <rect x="110" y="110" width="180" height="220" rx="12" className="fill-background stroke-border" strokeWidth="2" />
                        <rect x="100" y="120" width="180" height="220" rx="12" className="fill-background stroke-border" strokeWidth="2" />
                        {/* Content lines */}
                        <rect x="124" y="156" width="100" height="8" rx="4" className="fill-primary" />
                        <rect x="124" y="178" width="132" height="6" rx="3" className="fill-muted-foreground/20" />
                        <rect x="124" y="196" width="120" height="6" rx="3" className="fill-muted-foreground/20" />
                        <rect x="124" y="214" width="140" height="6" rx="3" className="fill-muted-foreground/20" />
                        <rect x="124" y="240" width="80" height="8" rx="4" className="fill-primary/60" />
                        <rect x="124" y="262" width="132" height="6" rx="3" className="fill-muted-foreground/20" />
                        <rect x="124" y="280" width="100" height="6" rx="3" className="fill-muted-foreground/20" />
                        {/* Checkmark badge */}
                        <circle cx="260" cy="140" r="24" className="fill-primary" />
                        <path d="M248 140L256 148L272 132" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {/* Collaboration illustration */}
                <div className="h-[400px] w-[400px] hidden md:flex items-center justify-center">
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        {/* Background circle */}
                        <circle cx="200" cy="200" r="140" className="fill-primary/5" />
                        {/* Central brain/idea node */}
                        <circle cx="200" cy="180" r="44" className="fill-primary/10 stroke-primary" strokeWidth="2" />
                        <path d="M182 180C182 170 188 162 200 162C212 162 218 170 218 180C218 188 212 192 208 194V200H192V194C188 192 182 188 182 180Z" className="fill-primary" />
                        <rect x="192" y="204" width="16" height="6" rx="3" className="fill-primary" />
                        {/* Connection lines */}
                        <line x1="168" y1="210" x2="130" y2="260" className="stroke-border" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="232" y1="210" x2="270" y2="260" className="stroke-border" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="200" y1="224" x2="200" y2="280" className="stroke-border" strokeWidth="2" strokeDasharray="4 4" />
                        {/* Person nodes */}
                        <circle cx="130" cy="280" r="22" className="fill-background stroke-border" strokeWidth="2" />
                        <circle cx="130" cy="274" r="8" className="fill-muted-foreground/40" />
                        <path d="M116 294C116 288 122 284 130 284C138 284 144 288 144 294" className="stroke-muted-foreground/40" strokeWidth="2" fill="none" />
                        <circle cx="200" cy="300" r="22" className="fill-background stroke-border" strokeWidth="2" />
                        <circle cx="200" cy="294" r="8" className="fill-muted-foreground/40" />
                        <path d="M186 314C186 308 192 304 200 304C208 304 214 308 214 314" className="stroke-muted-foreground/40" strokeWidth="2" fill="none" />
                        <circle cx="270" cy="280" r="22" className="fill-background stroke-border" strokeWidth="2" />
                        <circle cx="270" cy="274" r="8" className="fill-muted-foreground/40" />
                        <path d="M256 294C256 288 262 284 270 284C278 284 284 288 284 294" className="stroke-muted-foreground/40" strokeWidth="2" fill="none" />
                        {/* Floating elements */}
                        <rect x="120" y="120" width="32" height="24" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1" />
                        <rect x="126" y="128" width="20" height="2" rx="1" className="fill-primary/40" />
                        <rect x="126" y="134" width="14" height="2" rx="1" className="fill-primary/40" />
                        <rect x="258" y="110" width="32" height="24" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1" />
                        <rect x="264" y="118" width="20" height="2" rx="1" className="fill-primary/40" />
                        <rect x="264" y="124" width="14" height="2" rx="1" className="fill-primary/40" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
