import { ArrowRight } from 'lucide-react';
import { LinkArrowRight, LinkBtn } from './LinksComponents';

function Card1(props) {
    const Icon = props?.data?.icon;
    return (
        <div
            key={props.data.id}
            className="animate-bento-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/40 hover:bg-white/[0.08]"
            >
            {/* Glow */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div
                className={`absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-r ${props.data.color} blur-3xl opacity-40`}
                />
            </div>

            {/* Icon */}
            <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${props.data.color} shadow-lg`}
            >
                {Icon && <Icon size={24} color="#fff" />}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold">{props.data.title}</h3>

            <p className="mt-4 mb-6 leading-relaxed text-gray-400 line-clamp-3 text-sm">
                {props.data.description}
            </p>

            {/* Button */}
            {props.btn}

        </div>
    )
}


function Card2(props) {
  return (
    <div
        className=" group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/[0.05]"
        >
        
        {/* Hover Glow */}
        <div className=" absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className={` absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl
            ${
                props?.glow === "cyan"
                ? "bg-cyan-500/30"
                : props?.glow === "violet"
                ? "bg-violet-500/30"
                : "bg-pink-500/30"
            }
            `} />
        </div>

        {/* Number */}
        {
            props.number && (
                <div className=" mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0B1120] text-xl font-black text-white">
                    {props.number}
                </div>
            )
        }


        <h3 className=" text-xl font-bold text-white">
            {props?.title}
        </h3>

        <p className=" mt-4 text-sm leading-relaxed text-white/60">
            {props?.desc}
        </p>

        {props.btn}
    </div>
  )
}

function Card3(props) {
    return (
    <div
      className=" group relative overflow-hidden rounded-[1.8rem] border border-base-content/10 bg-base-100/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-info/30 hover:shadow-2xl hover:shadow-info/10 animate-slide-right"
    >
      
      {/* Neon Glow Hover */}
      <div className=" absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none
      ">    
            <div className=" absolute -top-20 right-0 h-40 w-40 rounded-full bg-info/20 blur-3xl" />
            <div className=" absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        {/* Image Container */}
        <div className="relative overflow-hidden">
            
            <div className=" relative aspect-video overflow-hidden bg-base-300 ">
            
            {/* Overlay Gradient */}
            <div className=" absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Animated Background */}
            <div className=" absolute inset-0 bg-gradient-to-br from-base-300 to-base-200 transition-transform duration-700 group-hover:scale-110" />

            {/* Image */}
            <img src={props.image || "/bg_secondary.webp"} alt="Photo du site web" className=" relative z-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />

            {/* Floating Language Badge */}
            <div className=" absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 backdrop-blur-xl">
                
                <div className=" h-2.5 w-2.5 rounded-full bg-info shadow-[0_0_12px] shadow-info " />

                <span className=" text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/80">
                {props.language}
                </span>
            </div>
            </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-7">
            
            {/* Title */}
            <h3 className="text-xl font-black leading-tight text-base-content transition-all duration-300 group-hover:text-info md:text-2xl">
                {props.title}
            </h3>

            {/* Divider */}
            <div className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-info to-secondary transition-all duration-500 group-hover:w-28" />

            {/* Description */}
            <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-base-content/70 md:text-[15px]">
                {props.description}
            </p>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-between">
            
                {/* Small Status */}
                {
                    props.active && (
                        <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
                            <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
                            {props.active}
                        </div>
                    )
                }

                {/* CTA */}
                {props?.btn}
            </div>
        </div>

    </div>
  )
}



function Card4(props) {
  const Icone = props.icone || "D";
  const title = props.title || "Titre";
  const subtitle = props.subtitle || "Sous-titre";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-base-content/10 bg-base-content/5 p-4 shadow-xl shadow-primary/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {Icone && (<Icone size={30} />)}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-base-content/80 uppercase">{title}</h4>
            <p className="text-base-content text-xs">{subtitle}</p>
        </div>
    </div>
  )
}


export { Card1, Card2, Card3, Card4 }