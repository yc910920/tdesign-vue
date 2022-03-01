import {
  computed, defineComponent, toRefs, h,
} from '@vue/composition-api';
import baseTableProps from './base-table-props';
import primaryTableProps from './primary-table-props';
import BaseTable from './base-table';
import { useTNodeJSX } from '../hooks/tnode';
import useColumnController from './hooks/useColumnController';
import useRowExpand from './hooks/useRowExpand';
import useTableHeader, { renderTitle } from './hooks/useTableHeader';
import { ROW_LISTENERS } from './hooks/useTableBody';
import useRowSelect from './hooks/useRowSelect';
import { TdPrimaryTableProps, PrimaryTableCol, TableRowData } from './type';
import useSorter from './hooks/useSorter';
import useFilter from './hooks/useFilter';
import useAsyncLoading from './hooks/useAsyncLoading';

export const ALL_EVENTS = ROW_LISTENERS.concat(['page-change', 'row-click', 'cell-click', 'scrollX', 'scrollY']);

export interface PrimaryTableListeners {
  [key: string]: Function;
}

export default defineComponent({
  name: 'TPrimaryTable',

  props: {
    ...baseTableProps,
    ...primaryTableProps,
  },

  setup(props: TdPrimaryTableProps, context) {
    const renderTNode = useTNodeJSX();
    const { columns } = toRefs(props);
    // 自定义列配置功能
    const { displayColumnKeys, renderColumnController } = useColumnController(props, context);
    // 展开/收起行功能
    const {
      showExpandedRow, showExpandIconColumn, getExpandColumn, renderExpandedRow, onInnerExpandRowClick,
    } = useRowExpand(props, context);
    // 排序功能
    const { renderSortIcon } = useSorter(props, context);
    // 行选中功能
    const { formatToRowSelectColumn, tRowClassNames } = useRowSelect(props, context);
    // 过滤功能
    const { hasEmptyCondition, renderFilterIcon, renderFirstFilterRow } = useFilter(props, context);
    const { renderTitleWidthIcon } = useTableHeader(props, context);
    const { renderAsyncLoading } = useAsyncLoading(props, context);

    // 1. 影响列数量的因素有：自定义列配置、展开/收起行、多级表头；2. 影响表头内容的因素有：排序图标、筛选图标
    const getColumns = (columns: PrimaryTableCol<TableRowData>[]) => {
      const arr: PrimaryTableCol<TableRowData>[] = [];
      for (let i = 0, len = columns.length; i < len; i++) {
        let item = { ...columns[i] };
        const isDisplayColumn = item.children?.length || displayColumnKeys.value?.includes(item.colKey);
        if (!isDisplayColumn) continue;
        item = formatToRowSelectColumn(item);
        // 添加排序图标和过滤图标
        if (item.sorter || item.filter) {
          const titleContent = renderTitle(h, context.slots, item, i);
          item.title = (h, p) => {
            const sortIcon = renderSortIcon(h, p);
            const filterIcon = renderFilterIcon(h, p);
            return renderTitleWidthIcon(h, [titleContent, sortIcon, filterIcon]);
          };
        }
        if (item.children?.length) {
          item.children = getColumns(item.children);
        }
        // 多级表头和自定义列配置特殊逻辑：要么子节点不存在，要么子节点长度大于 1，方便做自定义列配置
        if (!item.children || item.children?.length) {
          arr.push(item);
        }
      }
      return arr;
    };

    const tColumns = computed(() => {
      const cols = getColumns(columns.value);
      if (showExpandIconColumn.value) {
        cols.unshift(getExpandColumn(h));
      }
      return cols;
    });

    return {
      tColumns,
      showExpandedRow,
      tRowClassNames,
      hasEmptyCondition,
      renderTNode,
      renderColumnController,
      renderExpandedRow,
      onInnerExpandRowClick,
      renderFirstFilterRow,
      renderAsyncLoading,
    };
  },

  methods: {
    // support @row-click @page-change @row-hover .etc. events, Vue3 do not need this function
    getListenser(): PrimaryTableListeners {
      const listenser: PrimaryTableListeners = {};
      ALL_EVENTS.forEach((key) => {
        listenser[key] = (...args: any) => {
          this.$emit(key, ...args);
        };
      });
      return listenser;
    },

    formatNode(api: string, renderInnerNode: Function, condition: boolean) {
      if (!condition) return this[api];
      const innerNode = renderInnerNode(h);
      const propsNode = this.renderTNode(api);
      return innerNode || propsNode
        ? () => (
            <div>
              {innerNode}
              {propsNode}
            </div>
        )
        : null;
    },
  },

  render() {
    const topContent = this.formatNode('topContent', this.renderColumnController, !!this.columnController);
    const firstFullRow = this.formatNode('firstFullRow', this.renderFirstFilterRow, this.hasEmptyCondition);
    const lastFullRow = this.formatNode('lastFullRow', this.renderAsyncLoading, !!this.asyncLoading);

    const props = {
      ...this.$props,
      rowClassName: this.tRowClassNames,
      columns: this.tColumns,
      renderExpandedRow: this.showExpandedRow ? this.renderExpandedRow : undefined,
      topContent,
      firstFullRow,
      lastFullRow,
    };

    // 事件，Vue3 do not need this.getListenser
    const on: PrimaryTableListeners = this.getListenser();
    if (this.expandOnRowClick) {
      on['row-click'] = this.onInnerExpandRowClick;
    }
    // replace `scopedSlots={this.$scopedSlots}` of `v-slots={this.$slots}` in Vue3
    return <BaseTable scopedSlots={this.$scopedSlots} props={props} on={on} {...this.$attrs} />;
  },
});
