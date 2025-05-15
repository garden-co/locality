import {
   Account,
   CoFeed,
   CoList,
   CoMap,
   FileStream,
   Group,
   ImageDefinition,
   Profile,
   co,
} from 'jazz-tools';
import { generateRandomCode, generateSlug } from './utils';

export const ReactionType = co.literal(
   'thumb-up',
   'thumb-down',
   'laugh',
   'heart',
   'sad',
   'angry',
   'surprised',
   'thinking',
   'wink',
   'clap',
   'fire',
   'fireworks',
   'party'
);

export class ReactionsList extends CoList.Of(ReactionType) {}

// Main entities
export class Label extends CoMap {
   name = co.string;
   color = co.string;
   deleted = co.optional.boolean;
}

export class LabelList extends CoList.Of(co.ref(Label)) {}

export class Attachment extends CoMap {
   name = co.string;
   file = co.optional.ref(FileStream);
   image = co.optional.ref(ImageDefinition);
   type = co.literal('image', 'video', 'audio', 'document', 'other');
   deleted = co.optional.boolean;
}

export class AttachmentList extends CoList.Of(co.ref(Attachment)) {}

export class Comment extends CoMap {
   content = co.string;
   parentIssue = co.ref(Issue);
   parentComment = co.optional.ref(Comment);
   reactions = co.ref(ReactionsList);
   attachments = co.ref(AttachmentList);
   deleted = co.optional.boolean;
}

export class CommentList extends CoList.Of(co.ref(Comment)) {}

export class PriorityList extends CoList.Of(
   co.literal('no-priority', 'low', 'medium', 'high', 'urgent')
) {}

export class UserProfile extends Profile {
   name = co.string;
   email = co.string;
   avatarUrl = co.optional.string;

   static validate(data: { name?: string; email?: string; other?: Record<string, unknown> }) {
      const errors: string[] = [];
      if (!data.name?.trim()) {
         errors.push('Please enter a name');
      }
      if (!data.email?.trim()) {
         errors.push('Please enter an email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
         errors.push('Please enter a valid email address');
      }
      return { errors };
   }
}

export const StatusType = co.literal(
   'backlog',
   'to-do',
   'in-progress',
   'technical-review',
   'completed',
   'paused',
   'archived'
);

export const PriorityType = co.literal('no-priority', 'low', 'medium', 'high', 'urgent');

export const Assignee = co.optional.ref(UserProfile);

export class Issue extends CoMap {
   identifier = co.string; // e.g., "JAZZ-101"
   title = co.string;
   description = co.string;
   assignee = Assignee;
   estimate = co.optional.number;
   dueDate = co.optional.Date;
   // status = co.optional.ref(Status);
   statusType = StatusType;
   priority = PriorityType;
   team = co.ref(Team);

   parentIssue = co.optional.ref(Issue);
   childIssues = co.optional.ref(IssueList);

   attachments = co.optional.ref(AttachmentList);
   labels = co.optional.ref(LabelList);
   comments = co.optional.ref(CommentList);
   reactions = co.optional.ref(ReactionsList);
   deleted = co.optional.boolean;

   parentOrganization = co.optional.ref(Organization);

   updateIssueStatus(newStatus: typeof StatusType) {
      this.statusType = newStatus;
   }

   updateIssuePriority(newPriority: typeof PriorityType) {
      this.priority = newPriority;
   }

   updateIssueAssignee(newAssignee: typeof Assignee) {
      this.assignee = newAssignee;
   }

   addIssueLabel(label: Label) {
      this.labels?.push(label);
   }

   removeIssueLabel(label: Label) {
      if (!this.labels) return;
      const filtered = this.labels.filter((l) => l !== label);
      const newLabels = LabelList.create([], this._owner);
      filtered.forEach((l) => {
         if (l) newLabels.push(l);
      });
      this.labels = newLabels;
   }
}

export function groupIssuesByStatus(issues: Issue[] | IssueList): Record<string, Issue[]> {
   return issues.reduce<Record<string, Issue[]>>((acc, issue) => {
      if (!issue) return acc;
      const statusType = issue.statusType;

      if (!acc[statusType]) {
         acc[statusType] = [];
      }

      acc[statusType].push(issue);

      return acc;
   }, {});
}

export function searchIssues(issues: Issue[] | IssueList, query: string) {
   return issues.filter(
      (issue) =>
         issue?.title?.toLowerCase().includes(query.toLowerCase()) ||
         issue?.description?.toLowerCase().includes(query.toLowerCase())
   );
}

export interface IssueFilters {
   status?: typeof StatusType;
   priority?: typeof PriorityType;
   assignee?: typeof Assignee;
   labels?: Label[];
}

export function filterIssues(issues: Issue[] | IssueList, filters: IssueFilters) {
   return issues.filter((issue) => {
      if (!issue) return false;

      // Filter by status if provided
      if (filters.status && issue.statusType !== filters.status) return false;

      // Filter by priority if provided
      if (filters.priority && issue.priority !== filters.priority) return false;

      // Filter by assignee if provided
      if (filters.assignee && issue.assignee !== filters.assignee) return false;

      // Filter by labels if provided
      if (filters.labels && filters.labels.length > 0) {
         if (!issue.labels) return false;

         // Check if issue has all the specified labels
         return filters.labels.every((label) => issue.labels?.includes(label));
      }

      return true;
   });
}

export class IssueList extends CoList.Of(co.ref(Issue)) {
   filterByStatus(status: typeof StatusType) {
      return this.filter((issue) => issue?.statusType === status);
   }

   filterByPriority(priority: typeof PriorityType) {
      return this.filter((issue) => issue?.priority === priority);
   }

   filterByAssignee(assignee: typeof Assignee) {
      return this.filter((issue) => issue?.assignee === assignee);
   }

   filterByLabel(label: Label) {
      return this.filter((issue) => issue?.labels?.includes(label));
   }

   searchIssues(query: string) {
      return searchIssues(this, query);
   }

   filterIssues(filters: IssueFilters) {
      return filterIssues(this, filters);
   }

   groupIssuesByStatus(): Record<string, Issue[]> {
      return groupIssuesByStatus(this);
   }
}

export class Team extends CoMap {
   name = co.string;
   slug = co.string;
   icon = co.string;
   color = co.string;

   issues = co.ref(IssueList);
   deleted = co.optional.boolean;
}

export class TeamList extends CoList.Of(co.ref(Team)) {}

export type PresenceStatus = 'online' | 'offline' | 'away';

interface PresenceUpdate {
   type: 'presence';
   data: {
      status: PresenceStatus;
   };
}

type LiveUpdate = PresenceUpdate;

export const LiveUpdates = CoFeed.Of(co.json<LiveUpdate>());

export class Organization extends CoMap {
   name = co.string;
   slug = co.string;
   teams = co.ref(TeamList);
   labels = co.ref(LabelList);
   liveUpdates = co.ref(LiveUpdates);
   deleted = co.optional.boolean;

   getTeamsForMember(userProfile: UserProfile) {
      const allTeams: Team[] = [];

      if (this.teams) {
         this.teams.forEach((team) => {
            if (
               team &&
               !team.deleted &&
               team._owner
                  .castAs(Group)
                  .members?.some((member) => member.account.profile?.id === userProfile.id)
            ) {
               allTeams.push(team);
            }
         });
      }

      return allTeams;
   }
}

export class OrganizationList extends CoList.Of(co.ref(Organization)) {}

export class AccountRoot extends CoMap {
   organizations = co.ref(OrganizationList);
   version = co.optional.number;
}

export class JazzAccount extends Account {
   profile = co.ref(UserProfile);
   root = co.ref(AccountRoot);

   async migrate(creationProps?: { name: string; email: string; other?: Record<string, unknown> }) {
      if (!this._refs.root && creationProps) {
         await this.initialMigration(this, creationProps);
         return;
      }

      // uncomment this to add migrations
      // const currentVersion = this.root?.version || 0;
      // if (currentVersion < 1) {
      //   await this.migrationV1();
      // }
   }

   private async initialMigration(
      me: JazzAccount,
      creationProps: {
         name: string;
         email: string;
         other?: Record<string, unknown>;
      }
   ) {
      const { name, email } = creationProps;
      // const profileErrors = UserProfile.validate({ name, email, ...other });
      // if (profileErrors.errors.length > 0) {
      //    throw new Error(`Invalid profile data: ${profileErrors.errors.join(', ')}`);
      // }

      const publicProfileGroup = Group.create(me);
      publicProfileGroup.addMember('everyone', 'reader');

      this.profile = UserProfile.create({ name, email }, publicProfileGroup);

      const randomCode = generateRandomCode();

      const defaultOrganization = createNewOrganization(me, {
         teamName: 'Dev',
         orgName: `Jazz-${randomCode}`,
         orgSlug: `jazz-${randomCode}`,
      });

      // Initialize root structure with version
      this.root = AccountRoot.create(
         {
            organizations: OrganizationList.create([defaultOrganization], Group.create(me)),
            version: 0, // Set initial version
         },
         Group.create(me)
      );
   }
}

export function createNewTeam(
   me: JazzAccount,
   props: {
      teamName: string;
      organizationGroup: Group;
      icon?: string;
      color?: string;
   }
) {
   const privateTeamGroup = Group.create(me);
   privateTeamGroup.extend(props.organizationGroup);

   // Create default team first without issues
   const newTeam = Team.create(
      {
         name: props.teamName,
         slug: generateSlug(props.teamName),
         icon: props.icon || '👥',
         color: props.color || '#0ea5e9',
         issues: IssueList.create([], privateTeamGroup),
      },
      privateTeamGroup
   );

   // Create issues with team reference
   const defaultIssue = Issue.create(
      {
         identifier: 'JAZZ-1',
         title: 'My Issue',
         description: 'My Issue Description',
         priority: 'medium',
         statusType: 'in-progress',
         assignee: me.profile,
         team: newTeam,
      },
      privateTeamGroup
   );

   const defaultComment = Comment.create(
      {
         content: 'This is a default comment',
         parentIssue: defaultIssue,
         reactions: ReactionsList.create([], privateTeamGroup),
         attachments: AttachmentList.create([], privateTeamGroup),
      },
      privateTeamGroup
   );

   defaultIssue.comments = CommentList.create([defaultComment], privateTeamGroup);

   const defaultSubissue = Issue.create(
      {
         identifier: 'JAZZ-1-1',
         title: 'My Subissue',
         description: 'My Subissue Description',
         priority: 'low',
         statusType: 'to-do',
         assignee: me.profile,
         parentIssue: defaultIssue,
         team: newTeam,
      },
      privateTeamGroup
   );

   defaultIssue.childIssues = IssueList.create([defaultSubissue], privateTeamGroup);

   // Add issues to the team
   newTeam.issues = IssueList.create([defaultIssue, defaultSubissue], {
      owner: privateTeamGroup,
   });

   return {
      team: newTeam,
      defaultIssue,
      defaultSubissue,
   };
}

export function createNewOrganization(
   me: JazzAccount,
   props: {
      teamName: string;
      orgName: string;
      orgSlug: string;
   }
) {
   const privateOrgGroup = Group.create(me);

   const {
      team: defaultTeam,
      defaultIssue,
      defaultSubissue,
   } = createNewTeam(me, {
      teamName: props.teamName,
      organizationGroup: privateOrgGroup,
   });

   const privateTeamGroup = defaultTeam._owner.castAs(Group);

   const defaultLabel_bug = Label.create(
      {
         name: 'Bug',
         color: '#f97316',
      },
      privateTeamGroup
   );

   const defaultLabel_feature = Label.create(
      {
         name: 'Feature',
         color: '#0ea5e9',
      },
      privateTeamGroup
   );

   const defaultLabel_documentation = Label.create(
      {
         name: 'Documentation',
         color: '#8b5cf6',
      },
      privateTeamGroup
   );

   const defaultLabel_question = Label.create(
      {
         name: 'Question',
         color: '#ec4899',
      },
      privateTeamGroup
   );

   const newOrganization = Organization.create(
      {
         name: props.orgName,
         slug: props.orgSlug,
         teams: TeamList.create([defaultTeam], privateTeamGroup),
         labels: LabelList.create(
            [
               defaultLabel_bug,
               defaultLabel_feature,
               defaultLabel_documentation,
               defaultLabel_question,
            ],
            {
               owner: privateTeamGroup,
            }
         ),
         liveUpdates: LiveUpdates.create([], privateTeamGroup),
      },
      privateOrgGroup
   );

   // Set organization reference on issues
   defaultIssue.parentOrganization = newOrganization;
   defaultSubissue.parentOrganization = newOrganization;

   return newOrganization;
}
