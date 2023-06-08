import { useRef, useState } from "react";
import styled from "@emotion/styled";
import { palette } from "@leafygreen-ui/palette";
import { Table, TableHeader } from "@leafygreen-ui/table";
import { useLeafyGreenTable } from "@leafygreen-ui/table/new";
import {
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { useVersionAnalytics } from "analytics";
import { BaseTable } from "components/Table/BaseTable";
import { getColumnTreeSelectFilterProps } from "components/Table/LGFilters";
import { TablePlaceholder } from "components/Table/TablePlaceholder";
import {
  TableFilterPopover,
  TableSearchPopover,
} from "components/TablePopover";
import { TaskLink } from "components/TasksTable/TaskLink";
import TaskStatusBadge from "components/TaskStatusBadge";
import {
  mapTaskToBarchartColor,
  mapTaskStatusToUmbrellaStatus,
  taskStatusesFilterTreeData,
} from "constants/task";
import { size } from "constants/tokens";
import { VersionTaskDurationsQuery } from "gql/generated/types";
import {
  useTaskStatuses,
  useStatusesFilter,
  useFilterInputChangeHandler,
} from "hooks";
import { useUpdateURLQueryParams } from "hooks/useUpdateURLQueryParams";
import { PatchTasksQueryParams, TaskStatus } from "types/task";
import { Unpacked } from "types/utils";
import { string } from "utils";
import { TaskDurationRow } from "./TaskDurationRow";

const { gray } = palette;
const { msToDuration } = string;

type Tasks = VersionTaskDurationsQuery["version"]["tasks"]["data"];

interface Props {
  tasks: Tasks;
  loading: boolean;
}

export const TaskDurationTable: React.VFC<Props> = ({ tasks, loading }) => {
  const { id: versionId } = useParams<{ id: string }>();
  const { sendEvent } = useVersionAnalytics(versionId);
  const updateQueryParams = useUpdateURLQueryParams();

  const { currentStatuses } = useTaskStatuses({ versionId });

  const filterProps = {
    resetPage: true,
    sendAnalyticsEvent: (filterBy: string) =>
      sendEvent({ name: "Filter Tasks", filterBy }),
  };

  const statusesFilter = useStatusesFilter({
    urlParam: PatchTasksQueryParams.Statuses,
    ...filterProps,
  });

  const taskFilter = useFilterInputChangeHandler({
    urlParam: PatchTasksQueryParams.TaskName,
    ...filterProps,
  });

  const variantFilter = useFilterInputChangeHandler({
    urlParam: PatchTasksQueryParams.Variant,
    ...filterProps,
  });

  const handleDurationSort = (direction: string) => {
    updateQueryParams({
      [PatchTasksQueryParams.Duration]: direction.toUpperCase(),
      [PatchTasksQueryParams.Page]: "0",
    });
  };

  const maxTimeTaken = findMaxTimeTaken(tasks);

  const [columnFilters, setColumnFilters] = useState([]);
  console.log(columnFilters);

  const filters = (args) => {
    console.log("ok");
    setColumnFilters(args);
  };

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const table = useLeafyGreenTable<Unpacked<Tasks>>({
    columns,
    containerRef: tableContainerRef,
    data: tasks ?? [],
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getSubRows: (originalRow) => originalRow.executionTasksFull,
    onColumnFiltersChange: filters,
    state: {
      columnFilters,
    },
    withPagination: true,
  });

  return (
    <TableWrapper>
      <BaseTable table={table} shouldAlternateRowColor />
      {/* <Table
        data={tasks}
        columns={[
          <StyledTableHeader
            key="duration-table-task-name"
            label={
              <TableHeaderLabel>
                Task Name
                <TableSearchPopover
                  value={taskFilter.inputValue}
                  onChange={taskFilter.setInputValue}
                  onConfirm={taskFilter.submitInputValue}
                  data-cy="task-name-filter-popover"
                />
              </TableHeaderLabel>
            }
          />,
          <StyledTableHeader
            key="duration-table-status"
            label={
              <TableHeaderLabel>
                Status
                <TableFilterPopover
                  value={statusesFilter.inputValue}
                  options={currentStatuses}
                  onConfirm={statusesFilter.setAndSubmitInputValue}
                  data-cy="status-filter-popover"
                />
              </TableHeaderLabel>
            }
          />,
          <StyledTableHeader
            key="duration-table-build-variant"
            label={
              <TableHeaderLabel>
                Build Variant
                <TableSearchPopover
                  value={variantFilter.inputValue}
                  onChange={variantFilter.setInputValue}
                  onConfirm={variantFilter.submitInputValue}
                  data-cy="build-variant-filter-popover"
                />
              </TableHeaderLabel>
            }
          />,
          <TableHeader
            key="duration-table-task-duration"
            label={<TableHeaderLabel>Task Duration</TableHeaderLabel>}
            handleSort={handleDurationSort}
          />,
        ]}
      >
        {({ datum }) => (
          <TaskDurationRow
            data-cy="task-duration-table-row"
            task={datum}
            maxTimeTaken={maxTimeTaken}
          />
        )}
      </Table> */}
      {loading && (
        <TablePlaceholder glyph="Refresh" message="Loading..." spin />
      )}
      {!loading && tasks.length === 0 && (
        <TablePlaceholder message="No tasks found." />
      )}
    </TableWrapper>
  );
};

const findMaxTimeTaken = (
  tasks: VersionTaskDurationsQuery["version"]["tasks"]["data"]
) => {
  if (tasks && tasks.length) {
    const durations = tasks.map((t) =>
      t.startTime !== null ? t.timeTaken : 0
    );
    return Math.max(...durations);
  }
  return 0;
};

const TableWrapper = styled.div`
  border-top: 3px solid ${gray.light2};

  // LeafyGreen applies overflow-x: auto to the table, which causes an overflow-y scrollbar
  // to appear. Since the table container will expand to fit its contents, we will never
  // overflow on the Y-axis. Therefore, hide the scroll bar.
  > div > div:last-of-type {
    overflow-y: hidden;
  }
`;

const StyledTableHeader = styled(TableHeader)`
  width: 15%;
`;

const TableHeaderLabel = styled.div`
  display: flex;
  align-items: center;
`;

const columns = [
  {
    accessorKey: "displayName",
    cell: ({
      getValue,
      row: {
        original: { id },
      },
    }) => {
      const displayName = getValue();
      return <TaskLink taskId={id} taskName={displayName} />;
    },
    header: "Task Name",
  },
  {
    accessorKey: "status",
    cell: ({ getValue }) => {
      const status = getValue();
      return <TaskStatusBadge status={status} />;
    },
    ...getColumnTreeSelectFilterProps({
      "data-cy": "status-filter-popover",
      tData: taskStatusesFilterTreeData,
      title: "Task Status",
    }),
  },
  {
    accessorKey: "buildVariantDisplayName",
    header: "Build Variant",
  },
  {
    accessorKey: "timeTaken",
    cell: ({
      column,
      getValue,
      row: {
        original: { status, ...original },
      },
    }) => {
      const timeTaken = getValue();
      const maxTimeTaken = column.getFacetedMinMaxValues();
      const barWidth = calculateBarWidth(timeTaken, maxTimeTaken);
      const barColor =
        mapTaskToBarchartColor[mapTaskStatusToUmbrellaStatus[status]];
      const startedWithZeroTime =
        original?.startTime === null && status === TaskStatus.Started;
      return startedWithZeroTime ? (
        <span>
          There is no task duration information for this task at this time.
        </span>
      ) : (
        <>
          <DurationBar width={barWidth} color={barColor} />
          <span>{msToDuration(timeTaken)}</span>
        </>
      );
    },
    header: "Task Duration",
  },
];

const calculateBarWidth = (value: number, max: number) =>
  max ? `${(value / max) * 100}%` : "0%";

const barHeight = "12px";

const DurationBar = styled.div<{ width: string; color: string }>`
  width: ${({ width }) => width};
  background-color: ${({ color }) => color};
  border-radius: ${size.m};
  height: ${barHeight};
`;
