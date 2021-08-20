import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';

export const dragDrop = (props) => {

    const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);
    const SortableItem = sortableElement(props => <tr {...props} />);
    const SortableContainer = sortableContainer(props => <tbody {...props} />);
    class SortableTable extends React.Component {
        state = {
            dataSource: data,
        };

        onSortEnd = ({ oldIndex, newIndex }) => {
            const { dataSource } = this.state;
            if (oldIndex !== newIndex) {
                const newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter(el => !!el);
                console.log('Sorted items: ', newData);
                this.setState({ dataSource: newData });
            }
        };

        DraggableContainer = props => (
            <SortableContainer
                useDragHandle
                disableAutoscroll
                helperClass="row-dragging"
                onSortEnd={this.onSortEnd}
                {...props}
            />
        );
        DraggableBodyRow = ({ className, style, ...restProps }) => {
            const { dataSource } = this.state;
            // function findIndex base on Table rowKey props and should always be a right array index
            const index = dataSource.findIndex(x => x.index === restProps['data-row-key']);
            return <SortableItem index={index} {...restProps} />;
        };
    };
};