import {FolderFilled} from '@ant-design/icons';

export const doingData = (itemList) => {
    return itemList.map((item) => {
        const {
            id, title, sons
        } = item;

        return sons ? {
            ...item,
            key: id,
            value: id,
            label: title,
            icon: <FolderFilled/>,
            title: (
                <span
                    title={title}
                    style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
            {title}
          </span>
            ),
            children: doingData(sons),
        } : {
            ...item,
            key: id,
            value: id,
            label: title,
            icon: <FolderFilled/>,
            title: (
                <span
                    title={title}
                    style={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </span>
            ),
        };
    })
}