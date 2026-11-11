/**
 * Structured roster for FallbackTeam. Group titles and roles resolve via i18n.
 * Members are grouped by department; cards show name + role. Names stay untranslated.
 * Jess Tham is covered by the founder section and omitted here.
 */

export type TeamMember = {
  name: string
  roleKey: string
}

export type TeamGroup = {
  titleKey: string
  members: TeamMember[]
}

const dept = {
  projectManagement: 'aboutTeam.departments.projectManagement',
  projectDelivery: 'aboutTeam.departments.projectDelivery',
  businessOperation: 'aboutTeam.departments.businessOperation',
} as const

const role = {
  juniorConsultant: 'aboutTeam.roles.juniorConsultant',
  consultant: 'aboutTeam.roles.consultant',
  seniorConsultant: 'aboutTeam.roles.seniorConsultant',
  consultantManager: 'aboutTeam.roles.consultantManager',
  seniorManager: 'aboutTeam.roles.seniorManager',
  businessAnalyst: 'aboutTeam.roles.businessAnalyst',
  projectManagement: 'aboutTeam.roles.projectManagement',
  softwareDeveloper: 'aboutTeam.roles.softwareDeveloper',
  sapAbapConsultant: 'aboutTeam.roles.sapAbapConsultant',
  businessAdminExecutive: 'aboutTeam.roles.businessAdminExecutive',
  hrAdmin: 'aboutTeam.roles.hrAdmin',
  businessOperationsManager: 'aboutTeam.roles.businessOperationsManager',
} as const

export const fallbackTeamGroups: TeamGroup[] = [
  {
    titleKey: dept.projectManagement,
    members: [
      {name: 'Aiswariyaah Rajakumar', roleKey: role.juniorConsultant},
      {name: 'Bavani Selvasingam', roleKey: role.businessAnalyst},
      {name: 'Lee Ling Ling', roleKey: role.projectManagement},
    ],
  },
  {
    titleKey: dept.projectDelivery,
    members: [
      {name: 'Abdul Wafir Azmi Ali', roleKey: role.consultant},
      {name: 'Alice Lim', roleKey: role.seniorConsultant},
      {name: 'Anis Shazwani binti Piaee', roleKey: role.juniorConsultant},
      {name: 'Cheah Jun Hong', roleKey: role.seniorConsultant},
      {name: 'Eggy Almoura', roleKey: role.consultantManager},
      {name: 'Fatin Faiza binti Mohd Faridul Atrash', roleKey: role.juniorConsultant},
      {name: 'Frederick Goh', roleKey: role.seniorManager},
      {name: 'John Wong', roleKey: role.consultant},
      {name: 'Lim Jing', roleKey: role.consultant},
      {name: 'Lucas Lee', roleKey: role.juniorConsultant},
      {name: 'Malathi Mathiyalagan', roleKey: role.consultant},
      {name: 'Mohammad Syafiq Bin Shuib', roleKey: role.softwareDeveloper},
      {name: 'Muhd Syahmi Syazwan Bin Sulaiman', roleKey: role.softwareDeveloper},
      {name: 'Najwa Binti Adnan', roleKey: role.juniorConsultant},
      {name: "Nurhani 'Afifah Mohamad Malike", roleKey: role.consultant},
      {name: 'Nurul Syazwani Binti Mohd Zullzaidi', roleKey: role.sapAbapConsultant},
      {name: 'Rick Goh', roleKey: role.seniorConsultant},
      {name: 'Syamimi Supalio', roleKey: role.juniorConsultant},
      {name: 'Ushantinie Uthayasorian', roleKey: role.softwareDeveloper},
      {name: 'Yap Jia Haur', roleKey: role.consultant},
    ],
  },
  {
    titleKey: dept.businessOperation,
    members: [
      {name: 'Nur Syazwani Uzma Binti Sazali', roleKey: role.businessAdminExecutive},
      {name: 'Sheryl Lee', roleKey: role.hrAdmin},
      {name: 'Tan Cheng Cheng', roleKey: role.businessOperationsManager},
    ],
  },
]
