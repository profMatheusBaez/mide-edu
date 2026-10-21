' ============================================================
'  MIDE EDU — lancador invisivel (Windows)
'  Sobe o servidor local SEM abrir nenhuma janela preta e deixa
'  o navegador abrir sozinho. Se a IDE ja estiver rodando, o
'  proprio servidor percebe e so abre a aba de novo.
' ============================================================
Option Explicit

Dim sh, fso, pasta, py, ok

Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

pasta = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = pasta

ok = False

' 0) Python portatil do pacote de laboratorio (pasta python\)
If fso.FileExists(pasta & "\python\pythonw.exe") Then
  sh.Run """" & pasta & "\python\pythonw.exe"" """ & pasta & "\servidor.py""", 0, False
  WScript.Quit 0
End If

' 1) pythonw.exe — o Python "sem console", o jeito certo no Windows
On Error Resume Next
sh.Run "pythonw """ & pasta & "\servidor.py""", 0, False
If Err.Number = 0 Then ok = True
Err.Clear

' 2) py -3 (o lancador oficial do Python), tambem escondido
If Not ok Then
  sh.Run "pyw -3 """ & pasta & "\servidor.py""", 0, False
  If Err.Number = 0 Then ok = True
  Err.Clear
End If

' 3) python.exe com a janela escondida (aparece so no gerenciador)
If Not ok Then
  sh.Run "python """ & pasta & "\servidor.py""", 0, False
  If Err.Number = 0 Then ok = True
  Err.Clear
End If
On Error Goto 0

If Not ok Then
  MsgBox "Python 3 nao foi encontrado neste computador." & vbCrLf & vbCrLf & _
         "Instale em https://www.python.org/downloads/ marcando a opcao" & vbCrLf & _
         """Add python.exe to PATH"" e rode este arquivo de novo.", _
         vbExclamation, "MIDE EDU"
End If
