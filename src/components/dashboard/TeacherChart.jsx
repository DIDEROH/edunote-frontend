import { motion } from "framer-motion";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

import {
    FaChalkboardTeacher
} from "react-icons/fa";


export default function TeacherChart({ data }) {


    const chartData =
        data?.map((item) => ({
            school: item.school_name,
            total: item.total,
            boys: item.boys,
            girls: item.girls,
        })) || [];


    return (

        <motion.div

            initial={{
                opacity:0,
                y:20
            }}

            animate={{
                opacity:1,
                y:0
            }}

            transition={{
                duration:.5
            }}

            className="
                rounded-3xl
                bg-white
                border
                border-slate-200
                shadow-xl
                p-6 -pl-10
            "

        >


            {/* Header */}

            <div className="
                flex
                items-center
                justify-between
                mb-8
            ">


                <div>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-slate-800
                    ">
                        Répartition des enseignants
                    </h2>


                    <p className="
                        text-slate-500
                        mt-1
                    ">
                        Personnel enseignant par établissement
                    </p>


                </div>



                <div className="
                    h-14
                    w-14
                    rounded-2xl
                    bg-violet-100
                    flex
                    items-center
                    justify-center
                ">

                    <FaChalkboardTeacher
                        className="
                            text-2xl
                            text-violet-600
                        "
                    />

                </div>


            </div>



            {/* Chart */}


            <div className="h-[420px]">


                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >


                    <BarChart

                        data={chartData}

                        layout="vertical"

                        margin={{
                            top:10,
                            right:20,
                            bottom:10
                        }}

                    >


                        <CartesianGrid
                            strokeDasharray="4 4"
                            horizontal={false}
                        />


                        <XAxis
                            type="number"
                        />


                        <YAxis

                            type="category"

                            dataKey="school"

                            width={150}

                            tick={{
                                fontSize:12
                            }}

                        />



                        <Tooltip
                            content={<CustomTooltip />}
                        />



                        <Legend />



                        <Bar

                            dataKey="total"

                            name="Total"

                            fill="#6366F1"

                            radius={[
                                0,
                                10,
                                10,
                                0
                            ]}

                        />


                        <Bar

                            dataKey="boys"

                            name="Hommes"

                            fill="#3B82F6"

                            radius={[
                                0,
                                10,
                                10,
                                0
                            ]}

                        />



                        <Bar

                            dataKey="girls"

                            name="Femmes"

                            fill="#EC4899"

                            radius={[
                                0,
                                10,
                                10,
                                0
                            ]}

                        />


                    </BarChart>


                </ResponsiveContainer>


            </div>


        </motion.div>

    );
}



function CustomTooltip({
    active,
    payload
}){


    if(
        !active ||
        !payload ||
        payload.length===0
    ){

        return null;

    }


    const school =
        payload[0]?.payload;


    return (

        <div className="
            bg-white
            border
            border-slate-200
            shadow-xl
            rounded-2xl
            p-4
        ">


            <h3 className="
                font-bold
                text-slate-800
                mb-3
            ">

                {school.school}

            </h3>



            {

                payload.map((item)=>(


                    <div

                        key={item.name}

                        className="
                            flex
                            justify-between
                            gap-8
                            py-1
                        "

                    >


                        <span
                            className="text-slate-500"
                        >

                            {item.name}

                        </span>


                        <strong>

                            {item.value}

                        </strong>


                    </div>


                ))

            }


        </div>

    );

}