import { useState } from "react";
import { QueryTabs } from "../query/query";
import { TopicsCard } from "../topics/topic";
import { Item, ItemContent } from "../ui/item";


export function UserCard() {
    const [selected, setSelected] = useState<string[]>([]);
    return <div className="flex w-full flex-col gap-6 justify-center bg-muted/85">
        <Item>
            <ItemContent>
                <QueryTabs selected={selected}>

                </QueryTabs>
            </ItemContent>
        </Item>
        <Item>
            <ItemContent>
                <TopicsCard {...{ selected, setSelected }} />
            </ItemContent>
        </Item>
    </div>
}