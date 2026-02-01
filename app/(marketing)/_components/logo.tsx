import Image from "next/image";

export const Logo = () => {
    return (
        <div className="hidden md:flex items-center gap-x-2">
            <Image
                src="/logo.svg"
                height="40"
                width="40"
                alt="Logo"
            />
            <p className="font-semibold">
                Mentis
            </p>
        </div>
    )
}
