name = input("Enter student name: ")

python = float(input("Enter Python mark: "))
maths = float(input("Enter Mathematics mark: "))
dbms = float(input("Enter DBMS mark: "))
cn = float(input("Enter Computer Networks mark: "))
os = float(input("Enter Operating Systems mark: "))

total = python + maths + dbms + cn + os
average = total / 5
percentage = total / 500 * 100

print("\n----- SEMESTER RESULT -----")
print("Student Name:", name)
print("Total Marks:", total, "/ 500")
print("Average Marks:", average)
print("Percentage:", percentage, "%")
