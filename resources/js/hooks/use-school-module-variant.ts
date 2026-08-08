import {
    branchAssignments,
    branchCertificates,
    branchCourses,
    branchPeople,
    schoolAssignments,
    schoolCertificates,
    schoolCoursesUi,
    schoolPeople,
} from '@/data/modules/school-modules';
import { useBranch } from '@/hooks/use-branch';

/** Pick HO vs branch fixture slice for shared school module pages. */
export function useSchoolModuleVariant() {
    const { isHeadOffice } = useBranch();

    return {
        isHeadOffice,
        people: isHeadOffice ? schoolPeople : branchPeople,
        courses: isHeadOffice ? schoolCoursesUi : branchCourses,
        certificates: isHeadOffice ? schoolCertificates : branchCertificates,
        assignments: isHeadOffice ? schoolAssignments : branchAssignments,
    };
}
