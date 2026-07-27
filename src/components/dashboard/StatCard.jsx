import { motion } from "framer-motion";
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
} from "react-icons/fa6";

const colors = {
    blue: {
        bg: "from-blue-500 to-cyan-500",
        light: "bg-blue-100",
        icon: "text-blue-600",
        progress: "from-blue-500 to-cyan-500",
    },

    violet: {
        bg: "from-violet-500 to-fuchsia-500",
        light: "bg-violet-100",
        icon: "text-violet-600",
        progress: "from-violet-500 to-fuchsia-500",
    },

    green: {
        bg: "from-emerald-500 to-green-500",
        light: "bg-emerald-100",
        icon: "text-emerald-600",
        progress: "from-emerald-500 to-green-500",
    },

    orange: {
        bg: "from-orange-500 to-amber-500",
        light: "bg-orange-100",
        icon: "text-orange-600",
        progress: "from-orange-500 to-amber-500",
    },
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
    const c = colors[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .45 }}
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            className="
                relative
                overflow-hidden
                rounded-3xl
                bg-white/80
                backdrop-blur-xl
                border
                border-slate-200
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-300
                p-6
                flex-none
            "
        >
            {/* Glow */}
            <div
                className={`
                    absolute
                    -right-12
                    -top-12
                    h-36
                    w-36
                    rounded-full
                    bg-gradient-to-r
                    ${c.bg}
                    opacity-10
                    blur-3xl
                `}
            />

            {/* Haut */}
            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500 font-medium">
                        {title}
                    </p>

                    <h2 className="mt-2 text-4xl font-black text-slate-800">
                        {value}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {subtitle}
                    </p>

                </div>

                <div
                    className={`
                        h-16
                        w-16
                        rounded-2xl
                        ${c.light}
                        flex
                        items-center
                        justify-center
                        shadow-inner
                    `}
                >
                    <Icon
                        className={`${c.icon} text-3xl`}
                    />
                </div>

            </div>

            {/* Barre */}
            <div className="mt-6">

                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${progress}%`,
                        }}
                        transition={{
                            duration: 1,
                        }}
                        className={`
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            ${c.progress}
                        `}
                    />

                </div>

            </div>

            {/* Bas */}
            <div className="mt-5 flex items-center justify-between">

                <span className="text-[10px] italic text-slate-500">
                    Mise à jour aujourd'hui
                </span>

                <div
                    className={`
                        flex
                        items-center
                        gap-2
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${
                            positive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }
                    `}
                >
                    {positive
                        ? <FaArrowTrendUp />
                        : <FaArrowTrendDown />
                    }

                    {progress}%

                </div>

            </div>

        </motion.div>
    );
}