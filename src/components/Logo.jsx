import Logo from "/logo.webp";

export default function LogoComponent({size}) {
    return (
        <img src={Logo} alt="Logo Edunote by Durinfo" className={`${size == "sm" ? "w-10 h-10" : "w-16 h-16"}`} />
    );
}