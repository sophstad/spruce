import styled from "@emotion/styled";
import {
  Description,
  H3,
  H3Props,
  Subtitle,
  SubtitleProps,
} from "@leafygreen-ui/typography";
import { DescriptionFieldProps, TitleFieldProps } from "@rjsf/utils";
import { size } from "constants/tokens";

type CustomTitleFieldProps = Pick<TitleFieldProps, "id" | "title" | "uiSchema">;

export const TitleField: React.FC<CustomTitleFieldProps> = ({
  id,
  title,
  uiSchema,
}) => {
  const isSectionTitle = uiSchema?.["ui:sectionTitle"] ?? false;
  const Component = isSectionTitle ? StyledH3 : StyledSubtitle;
  return <Component id={id}>{title}</Component>;
};

const StyledH3 = styled(H3)<H3Props>`
  margin-top: ${size.m};
  margin-bottom: 12px;
`;

const StyledSubtitle = styled(Subtitle)<SubtitleProps>`
  margin-top: ${size.s};
  margin-bottom: 12px;
`;

export const DescriptionField: React.VFC<DescriptionFieldProps> = ({
  description,
  id,
}) =>
  description ? (
    <StyledDescription id={id}>{description}</StyledDescription>
  ) : null;

const StyledDescription = styled(Description)`
  margin-bottom: 12px;
`;
