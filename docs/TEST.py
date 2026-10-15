name = input("Enter student name: ")

cat1 = float(input("Enter CAT I mark: "))
cat2 = float(input("Enter CAT II mark: "))
assignment = float(input("Enter assignment mark: "))
attendance = float(input("Enter attendance percentage: "))
end_sem = float(input("Enter end semester mark: "))

cat1_mark = cat1 * 20 / 100
cat2_mark = cat2 * 20 / 100
assignment_mark = assignment * 10 / 100
attendance_mark = attendance * 10 / 100
end_sem_mark = end_sem * 40 / 100

total = cat1_mark + cat2_mark + assignment_mark + attendance_mark + end_sem_mark

print("\n----- STUDENT ACADEMIC REPORT -----")
print("Student Name:", name)
print("CAT I Contribution:", cat1_mark)
print("CAT II Contribution:", cat2_mark)
print("Assignment Contribution:", assignment_mark)
print("Attendance Contribution:", attendance_mark)
print("End Semester Contribution:", end_sem_mark)
print("Overall Mark:", total)
