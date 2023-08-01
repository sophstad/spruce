import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "components/SearchableDropdown";
import { getDistroSettingsRoute } from "constants/routes";
import { DistrosQuery, DistrosQueryVariables } from "gql/generated/types";
import { GET_DISTROS } from "gql/queries";

interface DistroSelectProps {
  selectedDistro: string;
}

export const DistroSelect: React.VFC<DistroSelectProps> = ({
  selectedDistro,
}) => {
  const navigate = useNavigate();

  const { data: distrosData, loading } = useQuery<
    DistrosQuery,
    DistrosQueryVariables
  >(GET_DISTROS, {
    variables: {
      onlySpawnable: false,
    },
  });
  const { distros = [] } = distrosData || {};

  return loading ? null : (
    <SearchableDropdown
      label="Distro"
      value={selectedDistro}
      options={distros.map((d) => d.name)}
      onChange={(distroId: string) => {
        navigate(getDistroSettingsRoute(distroId));
      }}
      data-cy="distro-select"
    />
  );
};