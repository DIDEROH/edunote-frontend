import {
    FaArrowTrendUp,
    FaArrowTrendDown,
} from "react-icons/fa6";

// Un seul accent (primary) pour l'icône ; la couleur ne sert plus qu'à
// varier légèrement l'intensité du fond de la pastille icône.
const colors = {
    blue: "bg-primary/10 text-primary",
    violet: "bg-secondary/10 text-secondary",
    green: "bg-success/10 text-success",
    orange: "bg-warning/10 text-warning",
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    progress = 75,
    positive = true,
}) {
    const iconStyle = colors[color] || colors.blue;

    return (
        <div className="relative rounded-md bg-base-200 p-6 flex-none">

            {/* Haut */}
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-base-content/60 font-medium">
                        {title}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-base-content">
                        {value}
                    </h2>

                    <p className="mt-2 text-xs text-base-content/50">
                        {subtitle}
                    </p>
                </div>

                <div className={`h-12 w-12 rounded-md flex items-center justify-center ${iconStyle}`}>
                    <Icon className="text-xl" />
                </div>

            </div>

            {/* Barre */}
            <div className="mt-6">
                <div className="h-1.5 rounded-sm bg-base-300 overflow-hidden">
                    <div
                        style={{ width: `${progress}%` }}
                        className="h-full rounded-sm bg-primary"
                    />
                </div>
            </div>

            {/* Bas */}
            <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-base-content/40">
                    Mise à jour aujourd'hui
                </span>

                <div
                    className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${
                        positive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}
                >
                    {positive ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                    {progress}%
                </div>
            </div>

        </div>
    );
}
