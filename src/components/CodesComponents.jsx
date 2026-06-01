import { Terminal } from "lucide-react"

function Code1({ animation }) {
    return(
        <div className={`${animation} animate-reveal relative rounded-xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden`}>
            <div className="flex items-center px-4 py-3 border-b border-base-300 bg-base-200">
                <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 text-xs font-mono text-base-content/60 flex items-center gap-2">
                <Terminal size={12}/> iot_optimizer.py
                </div>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono text-base-content/80 leading-relaxed">
                <pre>
                    <code>
                        <span className="text-pink-400">import</span> asyncio<br/>
                        <span className="text-pink-400">from</span> hardware <span className="text-pink-400">import</span> ArduinoController<br/><br/>
                        <span className="text-blue-400">async def</span> <span className="text-green-400">optimize_sensors</span>(fleet_id):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;controller = ArduinoController(id=fleet_id)<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-base-content/60"># Réduction de la latence de 40% via Websockets</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;metrics = <span className="text-pink-400">await</span> controller.gather_data()<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if</span> metrics.latency &gt; <span className="text-orange-400">0.05</span>:<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">await</span> controller.recalibrate_nodes()<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> <br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-300">"status"</span>: <span className="text-green-300">"optimized"</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-300">"data"</span>: metrics.to_json()<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </code>
                </pre>
            </div>
        </div>
    )
}


export { Code1 }