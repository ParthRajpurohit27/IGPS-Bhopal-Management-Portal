'use server';
/**
 * @fileOverview Provides a daily attendance summary for administrators.
 *
 * - adminDailyAttendanceSummary - A function that generates an AI-powered daily attendance summary for teachers.
 * - AdminDailyAttendanceSummaryInput - The input type for the adminDailyAttendanceSummary function.
 * - AdminDailyAttendanceSummaryOutput - The return type for the adminDailyAttendanceSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminDailyAttendanceSummaryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The date for which to generate the attendance summary (YYYY-MM-DD).'),
  allTeachers: z.array(z.object({
    employeeId: z.string().describe('Unique identifier for the teacher.'),
    name: z.string().describe('The full name of the teacher.'),
  })).describe('A list of all teachers in the school.'),
  dailyAttendance: z.array(z.object({
    employeeId: z.string().describe('The employee ID of the teacher.'),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/).describe('The teacher\'s check-in time (HH:MM).'),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).optional().describe('The teacher\'s check-out time (HH:MM).'),
  })).describe('Attendance records for the specified date.'),
  dailyHolidays: z.array(z.string()).describe('A list of employee IDs of teachers who are on holiday for the specified date.'),
  schoolStartTime: z.string().regex(/^\d{2}:\d{2}$/).describe('The official school start time (HH:MM).'),
  schoolEndTime: z.string().regex(/^\d{2}:\d{2}$/).describe('The official school end time (HH:MM).'),
});
export type AdminDailyAttendanceSummaryInput = z.infer<typeof AdminDailyAttendanceSummaryInputSchema>;

const AdminDailyAttendanceSummaryOutputSchema = z.object({
  summaryStatement: z.string().describe('A general summary statement about the day\'s attendance.'),
  presentTeachers: z.array(z.object({
    employeeId: z.string().describe('Unique identifier for the teacher.'),
    name: z.string().describe('The full name of the teacher.'),
    checkInTime: z.string().describe('The teacher\'s check-in time (HH:MM).'),
    checkOutTime: z.string().optional().describe('The teacher\'s check-out time (HH:MM).'),
    isUnusualCheckIn: z.boolean().describe('True if the check-in time is significantly earlier or later than school start time.'),
    isUnusualCheckOut: z.boolean().optional().describe('True if the check-out time is significantly earlier than school end time.'),
  })).describe('A list of teachers who were present.'),
  absentTeachers: z.array(z.object({
    employeeId: z.string().describe('Unique identifier for the teacher.'),
    name: z.string().describe('The full name of the teacher.'),
  })).describe('A list of teachers who were absent.'),
  holidayTeachers: z.array(z.object({
    employeeId: z.string().describe('Unique identifier for the teacher.'),
    name: z.string().describe('The full name of the teacher.'),
  })).describe('A list of teachers who were on holiday.'),
});
export type AdminDailyAttendanceSummaryOutput = z.infer<typeof AdminDailyAttendanceSummaryOutputSchema>;

// Helper function to parse time strings into Date objects for comparison
function parseTime(timeStr: string, dateStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Helper function to determine if check-in/out times are unusual
function calculateUnusualTimes(
  checkInTimeStr: string,
  checkOutTimeStr: string | undefined,
  schoolStartTimeStr: string,
  schoolEndTimeStr: string,
  dateStr: string
) {
  const schoolStartTime = parseTime(schoolStartTimeStr, dateStr);
  const schoolEndTime = parseTime(schoolEndTimeStr, dateStr);
  const checkInTime = parseTime(checkInTimeStr, dateStr);

  let isUnusualCheckIn = false;
  if (checkInTime.getTime() < schoolStartTime.getTime() - 15 * 60 * 1000 ||
      checkInTime.getTime() > schoolStartTime.getTime() + 30 * 60 * 1000) {
    isUnusualCheckIn = true;
  }

  let isUnusualCheckOut = false;
  if (checkOutTimeStr) {
    const checkOutTime = parseTime(checkOutTimeStr, dateStr);
    if (checkOutTime.getTime() < schoolEndTime.getTime() - 30 * 60 * 1000) {
      isUnusualCheckOut = true;
    }
  }

  return { isUnusualCheckIn, isUnusualCheckOut };
}

const AdminDailyAttendanceSummaryPromptInputSchema = z.object({
  date: z.string().describe('The date for the summary.'),
  processedTeacherData: z.array(z.object({
    employeeId: z.string(),
    name: z.string(),
    status: z.enum(['present', 'absent', 'holiday']),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    isUnusualCheckIn: z.boolean().optional(),
    isUnusualCheckOut: z.boolean().optional(),
  })).describe('Pre-processed attendance data for all teachers including their status and flags for unusual times.'),
});

const attendanceSummaryPrompt = ai.definePrompt({
  name: 'adminDailyAttendanceSummaryPrompt',
  input: { schema: AdminDailyAttendanceSummaryPromptInputSchema },
  output: { schema: AdminDailyAttendanceSummaryOutputSchema },
  prompt: `You are an AI assistant tasked with generating a daily attendance summary for school teachers.

Generate a concise summary statement and categorize teachers based on their attendance status for {{date}}.
For present teachers, highlight any unusual check-in or check-out times.

Here is the processed teacher attendance data:
{{#each processedTeacherData}}
  - Employee ID: {{{employeeId}}}, Name: {{{name}}}, Status: {{{status}}}
    {{#if checkInTime}} Check-in: {{{checkInTime}}}{{#if isUnusualCheckIn}} (Unusual){{/if}}{{/if}}
    {{#if checkOutTime}} Check-out: {{{checkOutTime}}}{{#if isUnusualCheckOut}} (Unusual){{/if}}{{/if}}
{{/each}}

Based on the above data, provide a daily attendance summary in JSON format.
Ensure all fields in the output schema are populated correctly.`,
});

// Logic extracted to be used by both flow and fallback
function getProcessedTeacherData(input: AdminDailyAttendanceSummaryInput) {
  const { date, allTeachers, dailyAttendance, dailyHolidays, schoolStartTime, schoolEndTime } = input;
  const attendanceMap = new Map(dailyAttendance.map(a => [a.employeeId, a]));
  const holidaySet = new Set(dailyHolidays);

  return allTeachers.map(teacher => {
    const isHoliday = holidaySet.has(teacher.employeeId);
    const attendanceRecord = attendanceMap.get(teacher.employeeId);

    if (isHoliday) {
      return { ...teacher, status: 'holiday' as const };
    } else if (attendanceRecord) {
      const { checkInTime, checkOutTime } = attendanceRecord;
      const { isUnusualCheckIn, isUnusualCheckOut } = calculateUnusualTimes(
        checkInTime,
        checkOutTime,
        schoolStartTime,
        schoolEndTime,
        date
      );
      return {
        ...teacher,
        status: 'present' as const,
        checkInTime,
        checkOutTime,
        isUnusualCheckIn,
        isUnusualCheckOut,
      };
    } else {
      return { ...teacher, status: 'absent' as const };
    }
  });
}

const adminDailyAttendanceSummaryFlow = ai.defineFlow(
  {
    name: 'adminDailyAttendanceSummaryFlow',
    inputSchema: AdminDailyAttendanceSummaryInputSchema,
    outputSchema: AdminDailyAttendanceSummaryOutputSchema,
  },
  async (input) => {
    const processedTeacherData = getProcessedTeacherData(input);
    const { output } = await attendanceSummaryPrompt({ date: input.date, processedTeacherData });

    const presentTeachers = processedTeacherData
      .filter(t => t.status === 'present' && t.checkInTime !== undefined)
      .map(t => ({
        employeeId: t.employeeId,
        name: t.name,
        checkInTime: t.checkInTime!,
        checkOutTime: t.checkOutTime,
        isUnusualCheckIn: t.isUnusualCheckIn || false,
        isUnusualCheckOut: t.isUnusualCheckOut || false,
      }));

    const absentTeachers = processedTeacherData
      .filter(t => t.status === 'absent')
      .map(t => ({ employeeId: t.employeeId, name: t.name }));

    const holidayTeachers = processedTeacherData
      .filter(t => t.status === 'holiday')
      .map(t => ({ employeeId: t.employeeId, name: t.name }));

    return {
      summaryStatement: output?.summaryStatement || `Daily attendance summary for ${input.date}.`,
      presentTeachers,
      absentTeachers,
      holidayTeachers,
    };
  }
);

export async function adminDailyAttendanceSummary(input: AdminDailyAttendanceSummaryInput): Promise<AdminDailyAttendanceSummaryOutput> {
  try {
    return await adminDailyAttendanceSummaryFlow(input);
  } catch (error) {
    console.warn("Genkit AI service unavailable for Admin Summary. Using fallback logic.", error);
    
    const processedTeacherData = getProcessedTeacherData(input);
    const presentCount = processedTeacherData.filter(t => t.status === 'present').length;
    const absentCount = processedTeacherData.filter(t => t.status === 'absent').length;

    return {
      summaryStatement: `Daily summary for ${input.date}: ${presentCount} teachers present, ${absentCount} absent. [Standard System Summary]`,
      presentTeachers: processedTeacherData.filter(t => t.status === 'present' && t.checkInTime !== undefined).map(t => ({
        employeeId: t.employeeId,
        name: t.name,
        checkInTime: t.checkInTime!,
        checkOutTime: t.checkOutTime,
        isUnusualCheckIn: t.isUnusualCheckIn || false,
        isUnusualCheckOut: t.isUnusualCheckOut || false,
      })),
      absentTeachers: processedTeacherData.filter(t => t.status === 'absent').map(t => ({ employeeId: t.employeeId, name: t.name })),
      holidayTeachers: processedTeacherData.filter(t => t.status === 'holiday').map(t => ({ employeeId: t.employeeId, name: t.name })),
    };
  }
}
