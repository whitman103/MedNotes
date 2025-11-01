import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Item, ItemContent, ItemTitle } from '@/components/ui/item'
import { LuAlbum, LuBrain } from "react-icons/lu";
import { GiHeartOrgan, GiRose, GiScalpel, GiKidneys, GiBabyFace, GiSausage } from "react-icons/gi";
import { BiSolidDonateBlood } from "react-icons/bi";
import { FaBacteria, FaEye } from "react-icons/fa";
import { LiaPoopSolid } from "react-icons/lia";
import { MdOutlineEmergency } from "react-icons/md";
import { Topic } from '@/generated_client';
import { cva } from 'class-variance-authority';
import type { IconType } from 'react-icons/lib';



interface IconColors {
    fill: string;
    stroke: string;
    icon: IconType;
}


const IconSettings: { [key: string]: IconColors } = Object.fromEntries(Object.values(Topic).map(value => [value, { 'fill': 'orange', 'stroke': 'black', icon: LuAlbum }]));
IconSettings['neurology'] = { 'fill': 'red', 'stroke': 'black', 'icon': LuBrain };
IconSettings['surgery'] = { 'fill': 'blue', 'stroke': 'black', 'icon': GiScalpel };
IconSettings['gynecology'] = { 'fill': 'pink', 'stroke': 'black', 'icon': GiRose };
IconSettings['cardiovascular'] = { 'fill': 'red', 'stroke': 'black', 'icon': GiHeartOrgan };
IconSettings['emergency'] = { 'fill': 'red', 'stroke': 'black', 'icon': MdOutlineEmergency };
IconSettings['gastroenterology'] = { 'fill': 'blue', 'stroke': 'black', 'icon': LiaPoopSolid };
IconSettings['hematology'] = { 'fill': 'red', 'stroke': 'black', 'icon': BiSolidDonateBlood };
IconSettings['nephrology'] = { 'fill': 'pink', 'stroke': 'black', 'icon': GiKidneys };
IconSettings['microbiology'] = { 'fill': 'green', 'stroke': 'black', 'icon': FaBacteria };
IconSettings['obstetrics'] = { 'fill': 'pink', 'stroke': 'black', 'icon': GiBabyFace };
IconSettings['ophthalmology'] = { 'fill': 'orange', 'stroke': 'black', 'icon': FaEye };
IconSettings['urology'] = { 'fill': 'red', 'stroke': 'white', 'icon': GiSausage }

export function TopicsCard({ selected, setSelected }: { selected: string[], setSelected: (string[]) }) {
    return <div className="flex w-full flex-col gap-6 justify-center bg-muted/85">
        <Item>
            <ItemContent>
                <ItemTitle className="text-lg">Topics</ItemTitle>
                <AutoToggle setSelected={setSelected} />
            </ItemContent>
        </Item>
        <Item variant='default' className="">
            <ItemTitle className="text-lg">Selected Topics</ItemTitle>
            <ItemContent>
                <div className="flex flex-wrap gap-2 items-center">
                    {selected.map((item, index) => {
                        // get icon dynamically, fallback to a placeholder if missing
                        const Icon = IconSettings[item].icon;

                        return (
                            <span key={item} className="flex items-center gap-1 text-lg">
                                {Icon && <Icon className="w-5 h-5 inline-block" fill={IconSettings[item].fill} stroke={IconSettings[item].stroke} />}
                                {item[0].toUpperCase() + item.slice(1)}
                                {index < selected.length - 1 ? "," : ""}
                            </span>
                        );
                    })}
                </div>
            </ItemContent>
        </Item>
    </div >
}

const toggleClasses = cva(
    "data-[state=off]:bg-transparent data-[state=on]:bg-muted/100 data-[state=on]:background-color-black data-[state=on]:font-bold",
    {
        variants: {
            fill: {
                red: "data-[state=on]:*:[svg]:fill-red-500",
                blue: "data-[state=on]:*:[svg]:fill-blue-500",
                orange: "data-[state=on]:*:[svg]:fill-orange-500",
                pink: 'data-[state=on]:*:[svg]:fill-pink-500',
                green: 'data-[state=on]:*:[svg]:fill-green-500'
            },
            stroke: {
                red: "data-[state=on]:*:[svg]:stroke-red-500",
                blue: "data-[state=on]:*:[svg]:stroke-blue-500",
                pink: "data-[state=on]:*:[svg]:stroke-pink-500",
                black: "data-[state=on]:*:[svg]:stroke-black-500",
                white: "data-[state=on]:*:[svg]:stroke-white-500",
            },
        },
    }
);

function AutoToggle({ setSelected }: { setSelected: ([]) => {} }) {
    return <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap max-w-[.5pw] gap-2 justify-center" spacing={2} size="sm" onValueChange={setSelected}>
        {
            Object.entries(IconSettings).map(([topic, iconSettings]) => {
                const Icon = iconSettings.icon;
                return (
                    <ToggleGroupItem value={topic} key={topic}
                        className={toggleClasses({ fill: iconSettings.fill, stroke: iconSettings.stroke })} >
                        {<Icon />}
                        {`${topic[0].toUpperCase() + topic.slice(1)}`}
                    </ToggleGroupItem>
                )
            }
            )
        }
    </ToggleGroup >
}
