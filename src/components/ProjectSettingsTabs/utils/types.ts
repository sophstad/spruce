export type AliasType = {
  id: string;
  alias: string;
  gitTag: string;
  remotePath: string;
  variant: string;
  variantTags: string[];
  task: string;
  taskTags: string[];
};

/* Projects are assigned to one of the following project types in order to manage which elements should appear on the page.
 * A project is an attached project if it has an associated repoRefId.
 */
export enum ProjectType {
  AttachedProject,
  Project,
  Repo,
}