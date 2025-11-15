' Launch Git Bash in project directory
Set objShell = CreateObject("WScript.Shell")

' Path to Git Bash
gitBashPath = "C:\Program Files\Git\git-bash.exe"

' Project directory
projectPath = "C:\Apps\HUDR\HHTool_Modular"

' Launch Git Bash with the project directory
objShell.Run """" & gitBashPath & """ --cd=""" & projectPath & """", 1, False
