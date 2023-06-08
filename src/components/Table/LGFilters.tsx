import { LeafyGreenTableRow } from "@leafygreen-ui/table/new";
import { TableFilterPopover } from "components/TablePopover";
import { TreeDataEntry } from "components/TreeSelect";

type TreeSelectFilterProps = {
  "data-cy"?: string;
  tData: TreeDataEntry[];
  title: React.ReactNode;
};

export const getColumnTreeSelectFilterProps = ({
  "data-cy": dataCy,
  tData,
  title,
}: TreeSelectFilterProps) => ({
  header: ({ column, ...rest }) => {
    const uniqueValues = column.getFacetedUniqueValues();

    const inTable = ({ value, children }: TreeDataEntry) => {
      if (uniqueValues.get(value)) return true;

      if (children?.length) return children.some(inTable);

      return false;
    };

    // Only present options that appear in the table
    const options = tData.filter(inTable);

    return (
      <>
        {title}
        <TableFilterPopover
          value={column?.getFilterValue() ?? []}
          options={options}
          onConfirm={(value) => {
            column.setFilterValue(value);
          }}
          data-cy={dataCy}
        />
      </>
    );
  },
  filterFn: (
    row: LeafyGreenTableRow<any>,
    columnId: string,
    filterValue: string[]
  ) => {
    console.log("HELLOOOO");
    console.log(filterValue);
    // If no filter is specified, show all rows
    if (!filterValue.length) {
      return true;
    }
    console.log(filterValue, row.getValue(columnId));
    return filterValue.includes(row.getValue(columnId));
  },
});
