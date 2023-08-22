//Docs https://mantine.dev/core/select/

import { forwardRef } from 'react';
import { Group, Avatar, Text } from '@mantine/core';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    image: string;
    label: string;
}

export const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ image, label, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={image} />

                <div>
                    <Text size="sm">{label}</Text>
                </div>
            </Group>
        </div>
    )
);