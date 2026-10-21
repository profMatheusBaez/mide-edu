/* GERADO por ferramentas/gerar_fases_microbit.mjs — não edite à mão.
   Cada fase vem dos BLOCOS (js/blocos_mb_*.js); o JavaScript e o MicroPython saem deles. */
'use strict';
const MB_FASES_GERADAS = [
 {
  "numero": 1,
  "modulo": 0,
  "n": 1,
  "nome": "Olá, mundo!",
  "objetivo": "Faça a micro:bit dizer olá passando uma mensagem pela tela de LEDs.",
  "conceito": "A tela da micro:bit tem 25 LEDs em uma grade de 5 por 5. Para escrever um texto, a placa acende os LEDs letra por letra, passando a palavra pela tela como um letreiro. O texto vai entre aspas. A tela só sabe desenhar letras sem acento, por isso escrevemos Ola e não Olá.",
  "resultado": "A palavra Ola! passa pela tela de LEDs uma vez, quando a micro:bit liga.",
  "desafio": "Troque Ola! pelo seu nome (sem acentos). Quanto mais comprido o texto, mais tempo ele demora para passar.",
  "aviso": null,
  "js": "basic.showString(\"Ola!\")\n",
  "py": "from microbit import *\n\ndisplay.scroll(\"Ola!\")\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "Ola!"
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 2,
  "modulo": 0,
  "n": 2,
  "nome": "Mostrando números",
  "objetivo": "Mostre dois números na tela, um depois do outro.",
  "conceito": "Números também passam pela tela, algarismo por algarismo. Como o programa roda muito rápido, precisamos de uma pausa para ver o primeiro número antes de o segundo chegar. A pausa é medida em milissegundos: 1000 milissegundos são 1 segundo.",
  "resultado": "A tela mostra o 7, espera 1 segundo e depois mostra o 2026.",
  "desafio": "Mostre a sua idade e, depois de 2 segundos, o ano em que você nasceu.",
  "aviso": null,
  "js": "basic.showNumber(7)\nbasic.pause(1000)\nbasic.showNumber(2026)\n",
  "py": "from microbit import *\n\ndisplay.scroll(7)\nsleep(1000)\ndisplay.scroll(2026)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 7
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_mostrar_numero",
             "inputs": {
              "N": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 2026
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 3,
  "modulo": 0,
  "n": 3,
  "nome": "Ícones prontos",
  "objetivo": "Faça um coração bater usando dois ícones prontos da micro:bit.",
  "conceito": "A micro:bit já vem com dezenas de desenhos prontos, chamados ícones: coração, rosto feliz, casa, pato… Basta escolher um. Colocando dois ícones um depois do outro dentro do laço “sempre”, o desenho parece se mexer, como um coração batendo.",
  "resultado": "Um coração grande e um coração pequeno se alternam na tela, como uma batida, sem parar.",
  "desafio": "Troque os corações por um rosto feliz e um rosto triste. Diminua a pausa para o coração bater mais rápido.",
  "aviso": null,
  "js": "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.pause(500)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(500)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\n    display.show(Image.HEART_SMALL)\n    sleep(500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Heart"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_mostrar_icone",
             "fields": {
              "ICONE": "SmallHeart"
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 500
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 4,
  "modulo": 0,
  "n": 4,
  "nome": "Desenhando na tela",
  "objetivo": "Desenhe o seu próprio rosto sorrindo, LED por LED.",
  "conceito": "Cada quadradinho do desenho é um LED da tela. Em JavaScript, o # acende o LED e o ponto . deixa apagado; em MicroPython, cada LED tem um brilho de 0 (apagado) a 9 (máximo). Nos blocos, é só clicar nos quadradinhos do bloco “mostrar LEDs”.",
  "resultado": "A tela mostra um rosto sorrindo: dois olhos em cima e um sorriso embaixo.",
  "desafio": "Mude o desenho para um rosto de surpresa: acenda a boca no meio (três LEDs juntos). Depois desenhe uma seta.",
  "aviso": null,
  "js": "basic.showLeds(`\n    . # . # .\n    . . . . .\n    # . . . #\n    . # # # .\n    . . . . .\n    `)\n",
  "py": "from microbit import *\n\ndisplay.show(Image(\"09090:00000:90009:09990:00000\"))\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_leds",
         "fields": {
          "LEDS": "0101000000100010111000000"
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 5,
  "modulo": 0,
  "n": 5,
  "nome": "Desafio: animação",
  "objetivo": "Crie uma animação de 4 quadros: um quadrado que cresce e volta a ser pequeno.",
  "conceito": "Uma animação é uma sequência de desenhos mostrada rápido. Cada desenho é um quadro. Com quatro quadros e uma pausa curta entre eles dentro do “sempre”, a micro:bit repete a animação para sempre. Quanto menor a pausa, mais rápida a animação.",
  "resultado": "Um ponto no centro cresce até virar um quadrado e depois a tela se apaga, em repetição.",
  "desafio": "Faça o quadrado crescer e depois encolher (7 quadros). Depois invente uma animação sua: uma bola quicando ou uma cobra andando.",
  "aviso": null,
  "js": "basic.forever(function () {\n    basic.showLeds(`\n        . . . . .\n        . . . . .\n        . . # . .\n        . . . . .\n        . . . . .\n        `)\n    basic.pause(200)\n    basic.showLeds(`\n        . . . . .\n        . # # # .\n        . # . # .\n        . # # # .\n        . . . . .\n        `)\n    basic.pause(200)\n    basic.showLeds(`\n        # # # # #\n        # . . . #\n        # . . . #\n        # . . . #\n        # # # # #\n        `)\n    basic.pause(200)\n    basic.clearScreen()\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.show(Image(\"00000:00000:00900:00000:00000\"))\n    sleep(200)\n    display.show(Image(\"00000:09990:09090:09990:00000\"))\n    sleep(200)\n    display.show(Image(\"99999:90009:90009:90009:99999\"))\n    sleep(200)\n    display.clear()\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_leds",
         "fields": {
          "LEDS": "0000000000001000000000000"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_mostrar_leds",
             "fields": {
              "LEDS": "0000001110010100111000000"
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 200
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_mostrar_leds",
                 "fields": {
                  "LEDS": "1111110001100011000111111"
                 },
                 "next": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 200
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "mb_limpar_tela",
                     "next": {
                      "block": {
                       "type": "mb_pausa",
                       "inputs": {
                        "MS": {
                         "block": {
                          "type": "math_number",
                          "fields": {
                           "NUM": 200
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 6,
  "modulo": 1,
  "n": 1,
  "nome": "Quando A for pressionado",
  "objetivo": "Faça um rosto feliz aparecer quando você apertar o botão A.",
  "conceito": "A micro:bit tem dois botões na frente, o A (esquerda) e o B (direita). Um evento é um aviso: “quando o botão A for pressionado, faça isto”. O programa fica esperando e, no instante do aperto, executa só o que está dentro do evento.",
  "resultado": "Ao apertar o botão A, um rosto feliz aparece na tela por 1 segundo e depois a tela apaga.",
  "desafio": "Troque o rosto feliz por outro ícone e aumente o tempo que ele fica na tela.",
  "aviso": null,
  "js": "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n    basic.pause(1000)\n    basic.clearScreen()\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if button_a.was_pressed():\n        display.show(Image.HAPPY)\n        sleep(1000)\n        display.clear()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Happy"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_limpar_tela"
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 7,
  "modulo": 1,
  "n": 2,
  "nome": "A, B e A+B",
  "objetivo": "Use os três eventos de botão: o A mostra 1, o B mostra 2 e A+B juntos mostram um coração.",
  "conceito": "Cada botão tem o seu próprio evento, e existe um terceiro: A+B, que só acontece quando os dois botões são apertados juntos. Repare que ele é diferente do A sozinho e do B sozinho. Dá para criar atalhos secretos combinando botões.",
  "resultado": "A mostra o número 1, B mostra o número 2 e A+B juntos mostram um coração.",
  "desafio": "Faça o A+B apagar tudo e mostrar a palavra Fim.",
  "aviso": null,
  "js": "input.onButtonPressed(Button.A, function () {\n    basic.showNumber(1)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showNumber(2)\n})\ninput.onButtonPressed(Button.AB, function () {\n    basic.showIcon(IconNames.Heart)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if button_a.was_pressed():\n        display.scroll(1)\n    if button_b.was_pressed():\n        display.scroll(2)\n    if (button_a.is_pressed() and button_b.is_pressed()):\n        display.show(Image.HEART)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 2
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "AB"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Heart"
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 8,
  "modulo": 1,
  "n": 3,
  "nome": "Contador com variável",
  "objetivo": "Crie um contador: A soma 1, B tira 1 e A+B volta para zero.",
  "conceito": "Uma variável é uma caixinha com nome onde o programa guarda um número. Aqui a variável contagem começa em 0. Cada clique muda o valor da caixinha, e depois mostramos o valor na tela. A variável lembra o número mesmo depois que o evento termina.",
  "resultado": "A soma 1 na contagem, B tira 1 e A+B zera. A tela sempre mostra o valor atual.",
  "desafio": "Impeça a contagem de ficar negativa: se ela for menor que 0, volte para 0.",
  "aviso": null,
  "js": "let contagem = 0\ncontagem = 0\ninput.onButtonPressed(Button.A, function () {\n    contagem += 1\n    basic.showNumber(contagem)\n})\ninput.onButtonPressed(Button.B, function () {\n    contagem += -1\n    basic.showNumber(contagem)\n})\ninput.onButtonPressed(Button.AB, function () {\n    contagem = 0\n    basic.showNumber(contagem)\n})\n",
  "py": "from microbit import *\n\ncontagem = 0\n\nwhile True:\n    if button_a.was_pressed():\n        contagem += 1\n        display.scroll(contagem)\n    if button_b.was_pressed():\n        contagem += -1\n        display.scroll(contagem)\n    if (button_a.is_pressed() and button_b.is_pressed()):\n        contagem = 0\n        display.scroll(contagem)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_contagem"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_contagem"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_contagem"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_contagem"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": -1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_contagem"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "AB"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_contagem"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_contagem"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "contagem",
     "id": "v_contagem"
    }
   ]
  }
 },
 {
  "numero": 9,
  "modulo": 1,
  "n": 4,
  "nome": "Logotipo de toque",
  "objetivo": "Use o logotipo dourado, em cima da tela, como um terceiro botão.",
  "conceito": "A micro:bit V2 tem um botão a mais: o logotipo dourado, que é sensível ao toque, como a tela de um celular. É só encostar o dedo nele. Esse recurso não existe na V1, e é por isso que este curso é só para a V2.",
  "resultado": "Ao tocar o logotipo, aparece um rosto surpreso. Depois de 1 segundo, a tela apaga.",
  "desafio": "Combine: o logotipo mostra o rosto surpreso e o botão A mostra o rosto feliz.",
  "aviso": null,
  "js": "input.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    basic.showIcon(IconNames.Surprised)\n    basic.pause(1000)\n    basic.clearScreen()\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if pin_logo.is_touched():\n        display.show(Image.SURPRISED)\n        sleep(1000)\n        display.clear()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_logo",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Surprised"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_limpar_tela"
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 10,
  "modulo": 1,
  "n": 5,
  "nome": "Desafio: placar de 2 times",
  "objetivo": "Faça um placar: o botão A marca ponto para o time A, o B para o time B, A+B mostra o placar e o logotipo zera.",
  "conceito": "Duas variáveis, uma por time, guardam os pontos. Cada botão soma na variável do seu time. Para mostrar o placar juntamos texto e números em uma frase só, como em “3 x 2”. O toque no logotipo começa um jogo novo, zerando as duas variáveis.",
  "resultado": "A e B somam pontos para cada time. A+B mostra o placar (por exemplo 3 x 2). O logotipo zera tudo.",
  "desafio": "Faça o placar mostrar Fim e um coração quando um dos times chegar a 10 pontos.",
  "aviso": null,
  "js": "let timeA = 0\nlet timeB = 0\ntimeA = 0\ntimeB = 0\ninput.onButtonPressed(Button.A, function () {\n    timeA += 1\n    basic.showNumber(timeA)\n})\ninput.onButtonPressed(Button.B, function () {\n    timeB += 1\n    basic.showNumber(timeB)\n})\ninput.onButtonPressed(Button.AB, function () {\n    basic.showString(\"\" + timeA + \" x \" + timeB)\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    timeA = 0\n    timeB = 0\n    basic.showIcon(IconNames.Yes)\n})\n",
  "py": "from microbit import *\n\ntimeA = 0\ntimeB = 0\n\nwhile True:\n    if button_a.was_pressed():\n        timeA += 1\n        display.scroll(timeA)\n    if button_b.was_pressed():\n        timeB += 1\n        display.scroll(timeB)\n    if (button_a.is_pressed() and button_b.is_pressed()):\n        display.scroll(str(timeA) + \" x \" + str(timeB))\n    if pin_logo.is_touched():\n        timeA = 0\n        timeB = 0\n        display.show(Image.YES)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_timeA"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_timeB"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_timeA"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_timeA"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_timeB"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_timeB"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "AB"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "text_join",
            "extraState": {
             "itemCount": 3
            },
            "inputs": {
             "ADD0": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_timeA"
                }
               }
              }
             },
             "ADD1": {
              "block": {
               "type": "text",
               "fields": {
                "TEXT": " x "
               }
              }
             },
             "ADD2": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_timeB"
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 900,
      "type": "mb_ao_logo",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_timeA"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_timeB"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_mostrar_icone",
             "fields": {
              "ICONE": "Yes"
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "timeA",
     "id": "v_timeA"
    },
    {
     "name": "timeB",
     "id": "v_timeB"
    }
   ]
  }
 },
 {
  "numero": 11,
  "modulo": 2,
  "n": 1,
  "nome": "Ler o nível de luz",
  "objetivo": "Mostre na tela quanta luz existe no ambiente.",
  "conceito": "A micro:bit não tem um sensor de luz separado: ela usa os próprios LEDs da tela como sensor! O valor vai de 0 (escuro total) a 255 (muita luz). Cubra a tela com a mão e veja o número cair.",
  "resultado": "A tela mostra um número entre 0 e 255. Cobrindo a tela com a mão, o número diminui.",
  "desafio": "Aponte a tela para a janela e depois para uma parede escura. Qual foi o maior e o menor valor?",
  "aviso": "A primeira leitura de luz pode sair 0 ou 255 por um instante: a placa precisa de um tempinho para trocar a tela de “mostrar” para “medir”. Ignore o primeiro valor. E como a luz é medida pelos LEDs, ler logo depois de mostrar um desenho na tela também dá um valor estranho.",
  "js": "basic.forever(function () {\n    basic.showNumber(input.lightLevel())\n    basic.pause(500)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.scroll(display.read_light_level())\n    sleep(500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_luz"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 12,
  "modulo": 2,
  "n": 2,
  "nome": "Luz em gráfico de barras",
  "objetivo": "Desenhe a quantidade de luz como um gráfico de barras na tela.",
  "conceito": "Ler um número e ler uma barra são coisas diferentes: o olho entende uma barra mais rápido. O gráfico de barras acende mais LEDs quanto maior for o valor em relação ao máximo. Aqui o máximo é 255, o topo da escala de luz.",
  "resultado": "Uma barra de LEDs cresce com a luz e diminui na sombra.",
  "desafio": "Troque o máximo de 255 para 100. O que muda? Por quê?",
  "aviso": null,
  "js": "basic.forever(function () {\n    led.plotBarGraph(input.lightLevel(), 255)\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\n\ndef grafico_barras(valor, maximo):\n    proporcao = abs(valor) / maximo if maximo > 0 else 0\n    k = 0\n    for y in range(4, -1, -1):\n        for x in range(3):\n            brilho = 9 if k <= proporcao else 0\n            display.set_pixel(2 - x, y, brilho)\n            display.set_pixel(2 + x, y, brilho)\n            k += 1 / 16\n\nwhile True:\n    grafico_barras(display.read_light_level(), 255)\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_grafico_barras",
         "inputs": {
          "V": {
           "block": {
            "type": "mb_luz"
           }
          },
          "MAX": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 255
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 100
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 13,
  "modulo": 2,
  "n": 3,
  "nome": "Noite e dia",
  "objetivo": "Mostre um rosto dormindo quando estiver escuro e um rosto feliz quando houver luz.",
  "conceito": "Uma decisão usa “se … senão”: se a condição for verdadeira, faz uma coisa; senão, faz outra. Aqui a condição é “a luz é menor que 50”. Um número de limite, como o 50, separa a noite do dia.",
  "resultado": "No escuro aparece um rosto dormindo; com luz, um rosto feliz.",
  "desafio": "Ajuste o número 50 para funcionar bem na sua sala.",
  "aviso": null,
  "js": "basic.forever(function () {\n    if (input.lightLevel() < 50) {\n        basic.showIcon(IconNames.Asleep)\n    } else {\n        basic.showIcon(IconNames.Happy)\n    }\n    basic.pause(300)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if display.read_light_level() < 50:\n        display.show(Image.ASLEEP)\n    else:\n        display.show(Image.HAPPY)\n    sleep(300)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_luz"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 50
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Asleep"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 300
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 14,
  "modulo": 2,
  "n": 4,
  "nome": "Luz no Monitor Serial",
  "objetivo": "Envie a luz para o computador e veja os números no Monitor Serial.",
  "conceito": "A porta USB também transporta mensagens da micro:bit para o computador. Isso se chama comunicação serial. O programa escreve “luz: 120” e o Monitor Serial da IDE mostra o texto; o Gráfico Serial desenha a linha. É a melhor forma de enxergar o que um sensor mede sem depender da tela pequena.",
  "resultado": "O Monitor Serial mostra uma linha “luz:” com o valor a cada 200 ms.",
  "desafio": "Passe a mão na frente da tela e veja o gráfico do valor mudar.",
  "aviso": null,
  "js": "basic.forever(function () {\n    serial.writeValue(\"luz\", input.lightLevel())\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    print(\"luz:\", display.read_light_level())\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_serial_valor",
         "inputs": {
          "NOME": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "luz"
            }
           }
          },
          "V": {
           "block": {
            "type": "mb_luz"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 15,
  "modulo": 2,
  "n": 5,
  "nome": "Desafio: luminária automática",
  "objetivo": "Faça a tela virar uma luminária: acende toda no escuro e apaga quando houver luz.",
  "conceito": "A luminária automática decide sozinha: no escuro, acende os 25 LEDs; com luz, apaga tudo. Repare que ela usa os mesmos LEDs que servem de sensor, por isso a leitura da luz precisa esperar o desenho ser trocado. Pequenas pausas ajudam a medir com calma.",
  "resultado": "No escuro, a tela acende inteira. Com luz, a tela apaga.",
  "desafio": "Acrescente um nível intermediário: com pouca luz, acenda só o meio da tela.",
  "aviso": "A luminária acende os mesmos LEDs que a placa usa para medir a luz. Por isso ela pode piscar de tempos em tempos: é normal.",
  "js": "basic.forever(function () {\n    if (input.lightLevel() < 50) {\n        basic.showLeds(`\n            # # # # #\n            # # # # #\n            # # # # #\n            # # # # #\n            # # # # #\n            `)\n    } else {\n        basic.clearScreen()\n    }\n    basic.pause(300)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if display.read_light_level() < 50:\n        display.show(Image(\"99999:99999:99999:99999:99999\"))\n    else:\n        display.clear()\n    sleep(300)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_luz"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 50
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_leds",
            "fields": {
             "LEDS": "1111111111111111111111111"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_limpar_tela"
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 300
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 16,
  "modulo": 3,
  "n": 1,
  "nome": "Ler a temperatura",
  "objetivo": "Mostre a temperatura, em graus Celsius, na tela.",
  "conceito": "O sensor de temperatura fica dentro do chip principal da micro:bit. Ele mede o calor do próprio chip, que é parecido com o do ar ao redor, mas um pouco mais alto quando a placa está ligada há um tempo. O valor vem em graus Celsius (°C).",
  "resultado": "A tela passa um número perto de 20 a 30 (a temperatura do ambiente).",
  "desafio": "Segure a placa entre as mãos por 1 minuto. O número subiu?",
  "aviso": null,
  "js": "basic.forever(function () {\n    basic.showNumber(input.temperature())\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.scroll(temperature())\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_temperatura"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 17,
  "modulo": 3,
  "n": 2,
  "nome": "Temperatura no Monitor Serial",
  "objetivo": "Envie a temperatura para o Monitor Serial do computador.",
  "conceito": "Números que mudam devagar, como a temperatura, ficam melhores no computador. Com a serial você enxerga uma linha por leitura e pode comparar os valores com calma. O nome “temp” que damos ao valor identifica o que está sendo medido.",
  "resultado": "O Monitor Serial mostra “temp:” e o valor, uma vez por segundo.",
  "desafio": "Assopre de leve no chip por 10 segundos e veja o valor mudar.",
  "aviso": null,
  "js": "basic.forever(function () {\n    serial.writeValue(\"temp\", input.temperature())\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    print(\"temp:\", temperature())\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_serial_valor",
         "inputs": {
          "NOME": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "temp"
            }
           }
          },
          "V": {
           "block": {
            "type": "mb_temperatura"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 18,
  "modulo": 3,
  "n": 3,
  "nome": "Frio, ok ou quente",
  "objetivo": "Mostre um ícone para cada faixa de temperatura: frio, ok e quente.",
  "conceito": "Quando há mais de duas respostas possíveis, usamos “se … senão se … senão”. O programa testa as condições em ordem e faz só a primeira que for verdadeira. Por isso a ordem importa: primeiro o mais frio, depois o intermediário; o “senão” final cobre o quente.",
  "resultado": "Abaixo de 20 °C aparece um rosto triste (frio); de 20 a 27 °C um rosto feliz (ok); acima disso um rosto bravo (quente).",
  "desafio": "Ajuste os limites 20 e 28 para o clima da sua cidade.",
  "aviso": null,
  "js": "basic.forever(function () {\n    if (input.temperature() < 20) {\n        basic.showIcon(IconNames.Sad)\n    } else if (input.temperature() < 28) {\n        basic.showIcon(IconNames.Happy)\n    } else {\n        basic.showIcon(IconNames.Angry)\n    }\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if temperature() < 20:\n        display.show(Image.SAD)\n    elif temperature() < 28:\n        display.show(Image.HAPPY)\n    else:\n        display.show(Image.ANGRY)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "extraState": {
          "elseIfCount": 1,
          "hasElse": true
         },
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_temperatura"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 20
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Sad"
            }
           }
          },
          "IF1": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_temperatura"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 28
               }
              }
             }
            }
           }
          },
          "DO1": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Angry"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 19,
  "modulo": 3,
  "n": 4,
  "nome": "Máxima e mínima registradas",
  "objetivo": "Guarde a maior e a menor temperatura medidas: o botão A mostra a máxima e o B mostra a mínima.",
  "conceito": "Uma variável lembra valores entre uma leitura e outra. A variável maxima começa baixa e a minima começa alta. Toda vez que a temperatura passa da máxima guardada (ou fica abaixo da mínima), o programa troca o valor guardado. Assim guardamos os recordes de calor e frio.",
  "resultado": "A micro:bit acompanha os recordes. Botão A mostra a máxima e botão B mostra a mínima.",
  "desafio": "Faça o logotipo zerar os recordes para começar de novo.",
  "aviso": null,
  "js": "let maxima = 0\nlet minima = 0\nmaxima = 0\nminima = 100\nbasic.forever(function () {\n    if (input.temperature() > maxima) {\n        maxima = input.temperature()\n    }\n    if (input.temperature() < minima) {\n        minima = input.temperature()\n    }\n    basic.pause(500)\n})\ninput.onButtonPressed(Button.A, function () {\n    basic.showNumber(maxima)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showNumber(minima)\n})\n",
  "py": "from microbit import *\n\nmaxima = 0\nminima = 100\n\nwhile True:\n    if temperature() > maxima:\n        maxima = temperature()\n    if temperature() < minima:\n        minima = temperature()\n    sleep(500)\n    if button_a.was_pressed():\n        display.scroll(maxima)\n    if button_b.was_pressed():\n        display.scroll(minima)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_maxima"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_minima"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 100
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "GT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_temperatura"
              }
             },
             "B": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_maxima"
                }
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_var_definir",
            "fields": {
             "VAR": {
              "id": "v_maxima"
             }
            },
            "inputs": {
             "VALOR": {
              "block": {
               "type": "mb_temperatura"
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "controls_if",
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_compare",
              "fields": {
               "OP": "LT"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "mb_temperatura"
                }
               },
               "B": {
                "block": {
                 "type": "variables_get",
                 "fields": {
                  "VAR": {
                   "id": "v_minima"
                  }
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_var_definir",
              "fields": {
               "VAR": {
                "id": "v_minima"
               }
              },
              "inputs": {
               "VALOR": {
                "block": {
                 "type": "mb_temperatura"
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 500
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "variables_get",
            "fields": {
             "VAR": {
              "id": "v_maxima"
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "variables_get",
            "fields": {
             "VAR": {
              "id": "v_minima"
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "maxima",
     "id": "v_maxima"
    },
    {
     "name": "minima",
     "id": "v_minima"
    }
   ]
  }
 },
 {
  "numero": 20,
  "modulo": 3,
  "n": 5,
  "nome": "Desafio: alarme de temperatura",
  "objetivo": "Toque um alarme e mostre um rosto bravo quando a temperatura passar de 30 °C.",
  "conceito": "Sensores + decisões = objetos inteligentes, como um alarme de incêndio. Uma comparação como “temperatura maior ou igual a 30” é uma pergunta cuja resposta é verdadeiro ou falso. Se for verdadeira, o programa mostra o alerta e toca um som; senão, mostra que está tudo bem.",
  "resultado": "Abaixo de 30 °C aparece um rosto feliz; a partir de 30 °C, aparece um rosto bravo e toca um apito.",
  "desafio": "Troque o 30 por um valor um pouco acima da temperatura da sala e aqueça a placa com as mãos.",
  "aviso": null,
  "js": "basic.forever(function () {\n    if (input.temperature() >= 30) {\n        basic.showIcon(IconNames.Angry)\n        music.playTone(880, music.beat(BeatFraction.Quarter))\n    } else {\n        basic.showIcon(IconNames.Happy)\n    }\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\nimport music\n\nwhile True:\n    if temperature() >= 30:\n        display.show(Image.ANGRY)\n        music.pitch(880, 500)\n    else:\n        display.show(Image.HAPPY)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "GTE"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_temperatura"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 30
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Angry"
            },
            "next": {
             "block": {
              "type": "mb_tocar_tom",
              "fields": {
               "B": "Quarter"
              },
              "inputs": {
               "F": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 880
                 }
                }
               }
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 21,
  "modulo": 4,
  "n": 1,
  "nome": "Quando agitar",
  "objetivo": "Mostre um rosto de surpresa quando alguém sacudir a placa.",
  "conceito": "Dentro da micro:bit há um acelerômetro, um sensor que sente movimento: balançar, inclinar e cair. A placa reconhece “gestos” prontos, como sacudir (shake). O gesto é um evento, igual ao botão: acontece e o programa reage.",
  "resultado": "Ao sacudir a placa, aparece um rosto de surpresa por 1 segundo e a tela apaga.",
  "desafio": "Troque o gesto “agitar” por “queda livre” e solte a placa em cima de um sofá (com cuidado!).",
  "aviso": null,
  "js": "input.onGesture(Gesture.Shake, function () {\n    basic.showIcon(IconNames.Surprised)\n    basic.pause(1000)\n    basic.clearScreen()\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if accelerometer.was_gesture(\"shake\"):\n        display.show(Image.SURPRISED)\n        sleep(1000)\n        display.clear()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "Shake"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Surprised"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_limpar_tela"
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 22,
  "modulo": 4,
  "n": 2,
  "nome": "Gestos: virar e inclinar",
  "objetivo": "Reaja a quatro gestos: tela para cima, tela para baixo, inclinar à esquerda e inclinar à direita.",
  "conceito": "Além de sacudir, a placa sabe quando é colocada com a tela para cima ou para baixo, ou inclinada para os lados. Cada gesto é um evento com um nome. O que você faz é ligar cada gesto a uma resposta.",
  "resultado": "Tela para cima mostra um rosto feliz; tela para baixo, um rosto dormindo; inclinar mostra uma seta para o lado.",
  "desafio": "Faça o gesto “logotipo para cima” mostrar uma seta para o Norte.",
  "aviso": null,
  "js": "input.onGesture(Gesture.ScreenUp, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onGesture(Gesture.ScreenDown, function () {\n    basic.showIcon(IconNames.Asleep)\n})\ninput.onGesture(Gesture.TiltLeft, function () {\n    basic.showArrow(ArrowNames.West)\n})\ninput.onGesture(Gesture.TiltRight, function () {\n    basic.showArrow(ArrowNames.East)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if accelerometer.was_gesture(\"face up\"):\n        display.show(Image.HAPPY)\n    if accelerometer.was_gesture(\"face down\"):\n        display.show(Image.ASLEEP)\n    if accelerometer.was_gesture(\"left\"):\n        display.show(Image.ARROW_W)\n    if accelerometer.was_gesture(\"right\"):\n        display.show(Image.ARROW_E)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "ScreenUp"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Happy"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "ScreenDown"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Asleep"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "TiltLeft"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_seta",
         "fields": {
          "DIR": "West"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "TiltRight"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_seta",
         "fields": {
          "DIR": "East"
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 23,
  "modulo": 4,
  "n": 3,
  "nome": "Aceleração x e y no Traçador",
  "objetivo": "Envie a aceleração dos eixos x e y para o computador e veja duas linhas no Gráfico Serial.",
  "conceito": "O acelerômetro mede a aceleração em três eixos: X (esquerda e direita), Y (frente e trás) e Z (em cima e embaixo). O valor é dado em milésimos da gravidade: com a placa parada e deitada, x e y ficam perto de 0. No Gráfico Serial cada valor enviado ganha uma linha própria.",
  "resultado": "O Gráfico Serial mostra duas linhas, x e y, que sobem e descem quando você inclina a placa.",
  "desafio": "Envie também o eixo z e observe o que acontece quando você vira a placa de cabeça para baixo.",
  "aviso": null,
  "js": "basic.forever(function () {\n    serial.writeValue(\"x\", input.acceleration(Dimension.X))\n    serial.writeValue(\"y\", input.acceleration(Dimension.Y))\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    print(\"x:\", accelerometer.get_x())\n    print(\"y:\", accelerometer.get_y())\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_serial_valor",
         "inputs": {
          "NOME": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "x"
            }
           }
          },
          "V": {
           "block": {
            "type": "mb_aceleracao",
            "fields": {
             "D": "X"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_serial_valor",
           "inputs": {
            "NOME": {
             "block": {
              "type": "text",
              "fields": {
               "TEXT": "y"
              }
             }
            },
            "V": {
             "block": {
              "type": "mb_aceleracao",
              "fields": {
               "D": "Y"
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 100
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 24,
  "modulo": 4,
  "n": 4,
  "nome": "Nível de bolha",
  "objetivo": "Faça um ponto andar pela tela conforme você inclina a placa, como a bolha de um nível.",
  "conceito": "O bloco “mapear” converte um valor de uma escala para outra: aqui, de -1000 a 1000 (o acelerômetro) para 0 a 4 (as colunas da tela). O “restringir” garante que o resultado nunca saia da tela. Assim o ponto anda de uma ponta à outra sem sair dos limites.",
  "resultado": "Um ponto aceso na linha do meio anda para a esquerda e para a direita quando você inclina a placa.",
  "desafio": "Faça o ponto se mexer também para cima e para baixo usando o eixo Y.",
  "aviso": null,
  "js": "let coluna = 0\ncoluna = 2\nbasic.forever(function () {\n    coluna = Math.constrain(pins.map(input.acceleration(Dimension.X), -1000, 1000, 0, 4), 0, 4)\n    basic.clearScreen()\n    led.plot(coluna, 2)\n    basic.pause(50)\n})\n",
  "py": "from microbit import *\n\ndef mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)\n\ncoluna = 2\n\nwhile True:\n    coluna = max(0, min(4, mapear(accelerometer.get_x(), -1000, 1000, 0, 4)))\n    display.clear()\n    display.set_pixel(coluna, 2, 9)\n    sleep(50)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_coluna"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 2
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_coluna"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_restringir",
            "inputs": {
             "V": {
              "block": {
               "type": "mb_mapear",
               "inputs": {
                "V": {
                 "block": {
                  "type": "mb_aceleracao",
                  "fields": {
                   "D": "X"
                  }
                 }
                },
                "A": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": -1000
                  }
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                },
                "C": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                },
                "D": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 4
                  }
                 }
                }
               }
              }
             },
             "MIN": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "MAX": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 4
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_limpar_tela",
           "next": {
            "block": {
             "type": "mb_acender",
             "inputs": {
              "X": {
               "block": {
                "type": "variables_get",
                "fields": {
                 "VAR": {
                  "id": "v_coluna"
                 }
                }
               }
              },
              "Y": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 2
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 50
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "coluna",
     "id": "v_coluna"
    }
   ]
  }
 },
 {
  "numero": 25,
  "modulo": 4,
  "n": 5,
  "nome": "Desafio: contador de passos",
  "objetivo": "Conte passos: a cada balançada da micro:bit, some 1 e mostre o total.",
  "conceito": "Um contador de passos de verdade sente cada vez que o corpo balança para frente e para trás. Aqui usamos o gesto de agitar como um “passo”: cada vez que ele acontece, somamos 1 na variável passos e mostramos o total. O botão A zera a contagem.",
  "resultado": "A cada balançada, o número na tela sobe em 1. O botão A volta para zero.",
  "desafio": "Faça a micro:bit mostrar um rosto feliz quando você completar 10 passos.",
  "aviso": null,
  "js": "let passos = 0\npassos = 0\ninput.onGesture(Gesture.Shake, function () {\n    passos += 1\n    basic.showNumber(passos)\n})\ninput.onButtonPressed(Button.A, function () {\n    passos = 0\n    basic.showNumber(passos)\n})\n",
  "py": "from microbit import *\n\npassos = 0\n\nwhile True:\n    if accelerometer.was_gesture(\"shake\"):\n        passos += 1\n        display.scroll(passos)\n    if button_a.was_pressed():\n        passos = 0\n        display.scroll(passos)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_passos"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "Shake"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_passos"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_passos"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_passos"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_passos"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "passos",
     "id": "v_passos"
    }
   ]
  }
 },
 {
  "numero": 26,
  "modulo": 5,
  "n": 1,
  "nome": "Calibrar e ler a direção",
  "objetivo": "Calibre a bússola e mostre o rumo, em graus, na tela.",
  "conceito": "A bússola (magnetômetro) sente o campo magnético da Terra e diz para onde a placa está apontando: 0° é o Norte, 90° o Leste, 180° o Sul e 270° o Oeste. Antes de usar é preciso calibrar: a placa pede para você inclinar até encher a tela de pontinhos, como um joguinho.",
  "resultado": "A placa pede a calibração; depois a tela mostra o rumo, de 0 a 359.",
  "desafio": "Gire devagar a placa em círculo e veja o número mudar. Em que giro aparece 90?",
  "aviso": "Calibre a bússola: a placa pede para inclinar até encher a tela de pontinhos. Fique longe de ímãs, alto-falantes e do computador. Sem calibrar, o rumo pode sair errado.",
  "js": "input.calibrateCompass()\nbasic.forever(function () {\n    basic.showNumber(input.compassHeading())\n    basic.pause(500)\n})\n",
  "py": "from microbit import *\n\ncompass.calibrate()\n\nwhile True:\n    display.scroll(compass.heading())\n    sleep(500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_calibrar_bussola"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_bussola"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 27,
  "modulo": 5,
  "n": 2,
  "nome": "Mostrar N, L, S e O",
  "objetivo": "Mostre a letra do ponto cardeal para onde a placa aponta: N, L, S ou O.",
  "conceito": "Dividimos o círculo de 360° em quatro partes. Perto de 0° (ou de 360°) é o Norte, por isso testamos os dois lados: “maior que 315 ou menor que 45”. O operador “ou” é verdadeiro se qualquer um dos lados for verdadeiro.",
  "resultado": "A tela mostra N, L, S ou O conforme a direção em que a placa aponta.",
  "desafio": "Crie ainda os pontos NE, SE, SO e NO dividindo o círculo em 8 partes.",
  "aviso": "Calibre a bússola: a placa pede para inclinar até encher a tela de pontinhos. Fique longe de ímãs, alto-falantes e do computador. Sem calibrar, o rumo pode sair errado.",
  "js": "input.calibrateCompass()\nbasic.forever(function () {\n    if (input.compassHeading() > 315 || input.compassHeading() < 45) {\n        basic.showString(\"N\")\n    } else if (input.compassHeading() < 135) {\n        basic.showString(\"L\")\n    } else if (input.compassHeading() < 225) {\n        basic.showString(\"S\")\n    } else {\n        basic.showString(\"O\")\n    }\n    basic.pause(500)\n})\n",
  "py": "from microbit import *\n\ncompass.calibrate()\n\nwhile True:\n    if compass.heading() > 315 or compass.heading() < 45:\n        display.scroll(\"N\")\n    elif compass.heading() < 135:\n        display.scroll(\"L\")\n    elif compass.heading() < 225:\n        display.scroll(\"S\")\n    else:\n        display.scroll(\"O\")\n    sleep(500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_calibrar_bussola"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "extraState": {
          "elseIfCount": 2,
          "hasElse": true
         },
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_operation",
            "fields": {
             "OP": "OR"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "GT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 315
                  }
                 }
                }
               }
              }
             },
             "B": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "LT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 45
                  }
                 }
                }
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_texto",
            "inputs": {
             "T": {
              "block": {
               "type": "text",
               "fields": {
                "TEXT": "N"
               }
              }
             }
            }
           }
          },
          "IF1": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_bussola"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 135
               }
              }
             }
            }
           }
          },
          "DO1": {
           "block": {
            "type": "mb_mostrar_texto",
            "inputs": {
             "T": {
              "block": {
               "type": "text",
               "fields": {
                "TEXT": "L"
               }
              }
             }
            }
           }
          },
          "IF2": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_bussola"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 225
               }
              }
             }
            }
           }
          },
          "DO2": {
           "block": {
            "type": "mb_mostrar_texto",
            "inputs": {
             "T": {
              "block": {
               "type": "text",
               "fields": {
                "TEXT": "S"
               }
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_texto",
            "inputs": {
             "T": {
              "block": {
               "type": "text",
               "fields": {
                "TEXT": "O"
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 28,
  "modulo": 5,
  "n": 3,
  "nome": "Seta que aponta o Norte",
  "objetivo": "Faça a tela mostrar uma seta que sempre aponta para o Norte, não importa para onde a placa esteja virada.",
  "conceito": "Aqui o programa transforma um número (o rumo) em um desenho (a seta). Se a placa está virada para o Leste (90°), o Norte fica à esquerda dela, então a seta aponta para o Oeste da tela. O “se … senão se …” escolhe a faixa certa entre as quatro possíveis.",
  "resultado": "A seta na tela aponta sempre para o Norte real, mesmo quando você gira a placa.",
  "desafio": "Faça a seta apontar para o Sul em vez de o Norte.",
  "aviso": "Calibre a bússola: a placa pede para inclinar até encher a tela de pontinhos. Fique longe de ímãs, alto-falantes e do computador. Sem calibrar, o rumo pode sair errado.",
  "js": "input.calibrateCompass()\nbasic.forever(function () {\n    if (input.compassHeading() > 315 || input.compassHeading() < 45) {\n        basic.showArrow(ArrowNames.North)\n    } else if (input.compassHeading() < 135) {\n        basic.showArrow(ArrowNames.West)\n    } else if (input.compassHeading() < 225) {\n        basic.showArrow(ArrowNames.South)\n    } else {\n        basic.showArrow(ArrowNames.East)\n    }\n    basic.pause(300)\n})\n",
  "py": "from microbit import *\n\ncompass.calibrate()\n\nwhile True:\n    if compass.heading() > 315 or compass.heading() < 45:\n        display.show(Image.ARROW_N)\n    elif compass.heading() < 135:\n        display.show(Image.ARROW_W)\n    elif compass.heading() < 225:\n        display.show(Image.ARROW_S)\n    else:\n        display.show(Image.ARROW_E)\n    sleep(300)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_calibrar_bussola"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "extraState": {
          "elseIfCount": 2,
          "hasElse": true
         },
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_operation",
            "fields": {
             "OP": "OR"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "GT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 315
                  }
                 }
                }
               }
              }
             },
             "B": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "LT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 45
                  }
                 }
                }
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_seta",
            "fields": {
             "DIR": "North"
            }
           }
          },
          "IF1": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_bussola"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 135
               }
              }
             }
            }
           }
          },
          "DO1": {
           "block": {
            "type": "mb_mostrar_seta",
            "fields": {
             "DIR": "West"
            }
           }
          },
          "IF2": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_bussola"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 225
               }
              }
             }
            }
           }
          },
          "DO2": {
           "block": {
            "type": "mb_mostrar_seta",
            "fields": {
             "DIR": "South"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_seta",
            "fields": {
             "DIR": "East"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 300
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 29,
  "modulo": 5,
  "n": 4,
  "nome": "Detector de ímã",
  "objetivo": "Mostre um alerta quando um ímã chegar perto da micro:bit.",
  "conceito": "O magnetômetro mede a força do campo magnético, em microtesla (µT). Longe de ímãs, o valor é o da Terra, entre 25 e 65 µT. Um detector compara o valor medido com um limite: aqui, 80 µT. Abaixo dele, tudo normal; acima dele, tem um ímã por perto.",
  "resultado": "Sem ímã aparece um rosto feliz. Com um ímã perto, aparece um rosto de susto.",
  "desafio": "Descubra o valor certo para a sua sala: some 15 ao maior valor que aparece sem ímã.",
  "aviso": null,
  "js": "basic.forever(function () {\n    if (input.magneticForce(Dimension.Strength) > 80) {\n        basic.showIcon(IconNames.Surprised)\n    } else {\n        basic.showIcon(IconNames.Happy)\n    }\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if (compass.get_field_strength() // 1000) > 80:\n        display.show(Image.SURPRISED)\n    else:\n        display.show(Image.HAPPY)\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "GT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_forca_magnetica",
               "fields": {
                "D": "Strength"
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 80
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Surprised"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 30,
  "modulo": 5,
  "n": 5,
  "nome": "Desafio: bússola com som",
  "objetivo": "Toque uma nota e mostre um coração quando a placa estiver apontando para o Norte.",
  "conceito": "A bússola com som avisa quando você “achou o Norte”: entre 350° e 10°. Como a faixa passa pelo zero, testamos os dois lados com “ou”: maior que 350 ou menor que 10. Ao achar o Norte, tocamos uma nota; fora dele, a tela fica apagada.",
  "resultado": "Girando devagar, ao apontar para o Norte a tela mostra um coração e toca uma nota.",
  "desafio": "Faça o som ficar mais agudo quanto mais perto do Norte você chegar.",
  "aviso": "Calibre a bússola: a placa pede para inclinar até encher a tela de pontinhos. Fique longe de ímãs, alto-falantes e do computador. Sem calibrar, o rumo pode sair errado.",
  "js": "input.calibrateCompass()\nbasic.forever(function () {\n    if (input.compassHeading() > 350 || input.compassHeading() < 10) {\n        basic.showIcon(IconNames.Heart)\n        music.playTone(Note.C5, music.beat(BeatFraction.Eighth))\n    } else {\n        basic.clearScreen()\n    }\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\nimport music\n\ncompass.calibrate()\n\nwhile True:\n    if compass.heading() > 350 or compass.heading() < 10:\n        display.show(Image.HEART)\n        music.pitch(523, 250)\n    else:\n        display.clear()\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_calibrar_bussola"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_operation",
            "fields": {
             "OP": "OR"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "GT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 350
                  }
                 }
                }
               }
              }
             },
             "B": {
              "block": {
               "type": "logic_compare",
               "fields": {
                "OP": "LT"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "mb_bussola"
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 10
                  }
                 }
                }
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Heart"
            },
            "next": {
             "block": {
              "type": "mb_tocar_nota",
              "fields": {
               "NOTA": "C5",
               "B": "Eighth"
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_limpar_tela"
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 100
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 31,
  "modulo": 6,
  "n": 1,
  "nome": "Nível de som",
  "objetivo": "Mostre na tela o nível de som que a micro:bit escuta.",
  "conceito": "A micro:bit V2 tem um microfone, na frente, ao lado de um pontinho que acende quando ele está ligado. O nível de som vai de 0 (silêncio) a 255 (barulho forte). Bata palmas perto da placa e veja o número subir.",
  "resultado": "A tela mostra números baixos no silêncio e altos com palmas ou voz alta.",
  "desafio": "Descubra qual é o nível de som da sua sala em silêncio e quando você fala normalmente.",
  "aviso": "O microfone da V2 fica na frente da placa, perto do logotipo. Não cubra com o dedo.",
  "js": "basic.forever(function () {\n    basic.showNumber(input.soundLevel())\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.scroll(microphone.sound_level())\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_nivel_som"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 32,
  "modulo": 6,
  "n": 2,
  "nome": "Quando o som for alto",
  "objetivo": "Faça um rosto feliz aparecer quando alguém bater palmas.",
  "conceito": "O microfone também gera um evento: “quando o som for alto”. Ele dispara quando o barulho passa de um limite (uma palma, um estalo ou um grito). Não precisa medir o nível de som: o evento já avisa.",
  "resultado": "Uma palma faz um rosto feliz aparecer por 1 segundo, e depois a tela apaga.",
  "desafio": "Faça uma segunda reação para o som baixo: um rosto dormindo.",
  "aviso": null,
  "js": "input.onSound(DetectedSound.Loud, function () {\n    basic.showIcon(IconNames.Happy)\n    basic.pause(1000)\n    basic.clearScreen()\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if microphone.was_event(SoundEvent.LOUD):\n        display.show(Image.HAPPY)\n        sleep(1000)\n        display.clear()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_som",
      "fields": {
       "S": "Loud"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_icone",
         "fields": {
          "ICONE": "Happy"
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_limpar_tela"
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 33,
  "modulo": 6,
  "n": 3,
  "nome": "Medidor de ruído em barras",
  "objetivo": "Mostre o barulho como um gráfico de barras que sobe e desce.",
  "conceito": "O gráfico de barras é uma boa forma de ver rápido se o ambiente está calmo ou barulhento. O máximo 255 é o maior nível de som que o microfone entrega.",
  "resultado": "A barra de LEDs sobe com o barulho e desce com o silêncio.",
  "desafio": "Troque o máximo 255 por 128 para o medidor ficar mais sensível.",
  "aviso": null,
  "js": "basic.forever(function () {\n    led.plotBarGraph(input.soundLevel(), 255)\n    basic.pause(50)\n})\n",
  "py": "from microbit import *\n\ndef grafico_barras(valor, maximo):\n    proporcao = abs(valor) / maximo if maximo > 0 else 0\n    k = 0\n    for y in range(4, -1, -1):\n        for x in range(3):\n            brilho = 9 if k <= proporcao else 0\n            display.set_pixel(2 - x, y, brilho)\n            display.set_pixel(2 + x, y, brilho)\n            k += 1 / 16\n\nwhile True:\n    grafico_barras(microphone.sound_level(), 255)\n    sleep(50)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_grafico_barras",
         "inputs": {
          "V": {
           "block": {
            "type": "mb_nivel_som"
           }
          },
          "MAX": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 255
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 50
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 34,
  "modulo": 6,
  "n": 4,
  "nome": "Palmas contam pontos",
  "objetivo": "Conte quantas palmas foram batidas e mostre o total.",
  "conceito": "Aqui misturamos duas ideias: o evento de som e uma variável que soma. Cada palma soma 1 na variável palmas. A pausa curta evita que uma palma só seja contada duas vezes por causa do eco. O botão A zera o contador.",
  "resultado": "A cada palma, o número na tela sobe em 1. O botão A zera o contador.",
  "desafio": "Faça a micro:bit acender um rosto feliz quando chegar a 10 palmas.",
  "aviso": null,
  "js": "let palmas = 0\npalmas = 0\ninput.onSound(DetectedSound.Loud, function () {\n    palmas += 1\n    basic.showNumber(palmas)\n    basic.pause(300)\n})\ninput.onButtonPressed(Button.A, function () {\n    palmas = 0\n    basic.showNumber(palmas)\n})\n",
  "py": "from microbit import *\n\npalmas = 0\n\nwhile True:\n    if microphone.was_event(SoundEvent.LOUD):\n        palmas += 1\n        display.scroll(palmas)\n        sleep(300)\n    if button_a.was_pressed():\n        palmas = 0\n        display.scroll(palmas)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_palmas"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_som",
      "fields": {
       "S": "Loud"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_palmas"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_palmas"
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 300
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_palmas"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_palmas"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "palmas",
     "id": "v_palmas"
    }
   ]
  }
 },
 {
  "numero": 35,
  "modulo": 6,
  "n": 5,
  "nome": "Desafio: silêncio na sala",
  "objetivo": "Faça um alerta de barulho: rosto bravo e um apito quando o nível de som passar de 120.",
  "conceito": "Um “silêncio na sala” fica de olho no nível de som e reage quando o barulho passa de um limite. Abaixo do limite mostra um rosto tranquilo; acima, mostra um rosto bravo e toca um apito curto. É uma forma divertida de ajudar a turma a controlar o volume.",
  "resultado": "Com a sala calma aparece um rosto feliz; se o barulho passar de 120, aparece um rosto bravo com um apito.",
  "desafio": "Ajuste o limite 120 para a sua sala e mostre também o número do nível de som.",
  "aviso": null,
  "js": "basic.forever(function () {\n    if (input.soundLevel() > 120) {\n        basic.showIcon(IconNames.Angry)\n        music.playTone(880, music.beat(BeatFraction.Eighth))\n    } else {\n        basic.showIcon(IconNames.Happy)\n    }\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\nimport music\n\nwhile True:\n    if microphone.sound_level() > 120:\n        display.show(Image.ANGRY)\n        music.pitch(880, 250)\n    else:\n        display.show(Image.HAPPY)\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "GT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_nivel_som"
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 120
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Angry"
            },
            "next": {
             "block": {
              "type": "mb_tocar_tom",
              "fields": {
               "B": "Eighth"
              },
              "inputs": {
               "F": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 880
                 }
                }
               }
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 36,
  "modulo": 7,
  "n": 1,
  "nome": "Tocar um tom",
  "objetivo": "Toque um tom de 440 Hz (a nota lá) por meio segundo.",
  "conceito": "A micro:bit V2 tem um alto-falante embutido, atrás da placa. Um tom é uma vibração com uma frequência, medida em hertz (Hz): quanto maior a frequência, mais agudo o som. O tom de 440 Hz é a nota lá, usada para afinar instrumentos. Além da frequência, informamos por quanto tempo tocar.",
  "resultado": "A micro:bit toca um bip de 440 Hz por meio segundo quando liga.",
  "desafio": "Toque um tom mais agudo (880 Hz) e um mais grave (220 Hz). Ouça a diferença.",
  "aviso": null,
  "js": "music.playTone(440, music.beat(BeatFraction.Half))\n",
  "py": "from microbit import *\nimport music\n\nmusic.pitch(440, 1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_tom",
         "fields": {
          "B": "Half"
         },
         "inputs": {
          "F": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 440
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 37,
  "modulo": 7,
  "n": 2,
  "nome": "Notas e batidas",
  "objetivo": "Toque dó, ré e mi com durações diferentes.",
  "conceito": "Uma nota musical tem um nome (dó, ré, mi…) e uma duração: a batida, que pode ser inteira, meia, um quarto… Batidas mais curtas fazem a nota passar mais depressa. Aqui tocamos as três primeiras notas da escala, cada uma com uma duração.",
  "resultado": "Toca um dó longo (meia batida), um ré médio (um quarto) e um mi curto (um oitavo).",
  "desafio": "Toque a escala inteira: dó, ré, mi, fá, sol, lá, si e dó agudo.",
  "aviso": null,
  "js": "music.playTone(Note.C, music.beat(BeatFraction.Half))\nmusic.playTone(Note.D, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.E, music.beat(BeatFraction.Eighth))\n",
  "py": "from microbit import *\nimport music\n\nmusic.pitch(262, 1000)\nmusic.pitch(294, 500)\nmusic.pitch(330, 250)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "C",
          "B": "Half"
         },
         "next": {
          "block": {
           "type": "mb_tocar_nota",
           "fields": {
            "NOTA": "D",
            "B": "Quarter"
           },
           "next": {
            "block": {
             "type": "mb_tocar_nota",
             "fields": {
              "NOTA": "E",
              "B": "Eighth"
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 38,
  "modulo": 7,
  "n": 3,
  "nome": "Melodias prontas",
  "objetivo": "Toque uma melodia que já vem pronta na micro:bit.",
  "conceito": "A micro:bit já traz melodias famosas gravadas: Parabéns, Ode à Alegria, Nyan Cat, a marcha fúnebre… Basta escolher pelo nome. A melodia toca até o fim antes do programa continuar.",
  "resultado": "A melodia “Parabéns” toca uma vez quando a placa liga, e a tela mostra um coração.",
  "desafio": "Troque a melodia por outra e faça-a tocar quando apertar o botão A.",
  "aviso": null,
  "js": "music.play(music.builtInPlayableMelody(Melodies.Birthday), music.PlaybackMode.UntilDone)\nbasic.showIcon(IconNames.Heart)\n",
  "py": "from microbit import *\nimport music\n\nmusic.play(music.BIRTHDAY)\ndisplay.show(Image.HEART)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_melodia",
         "fields": {
          "M": "Birthday"
         },
         "next": {
          "block": {
           "type": "mb_mostrar_icone",
           "fields": {
            "ICONE": "Heart"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 39,
  "modulo": 7,
  "n": 4,
  "nome": "Sons expressivos",
  "objetivo": "Dê voz à micro:bit: uma risada no botão A e um “olá” no botão B.",
  "conceito": "A V2 também tem sons expressivos: risada, bocejo, “hello”, “mysterious”… Eles são pequenos efeitos sonoros já prontos. Servem para dar personalidade ao seu projeto, como em um robô ou em um jogo.",
  "resultado": "O botão A toca uma risada e o botão B toca um som de “hello”.",
  "desafio": "Junte som e imagem: mostre um rosto feliz enquanto a risada toca.",
  "aviso": null,
  "js": "input.onButtonPressed(Button.A, function () {\n    soundExpression.giggle.playUntilDone()\n})\ninput.onButtonPressed(Button.B, function () {\n    soundExpression.hello.playUntilDone()\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    if button_a.was_pressed():\n        audio.play(Sound.GIGGLE)\n    if button_b.was_pressed():\n        audio.play(Sound.HELLO)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_som",
         "fields": {
          "S": "giggle"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_som",
         "fields": {
          "S": "hello"
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 40,
  "modulo": 7,
  "n": 5,
  "nome": "Desafio: teclado musical",
  "objetivo": "Monte um teclado com três teclas: A toca dó, B toca mi e o logotipo toca sol.",
  "conceito": "Um instrumento é um conjunto de eventos: cada tecla dispara uma nota. Com o botão A, o botão B e o logotipo sensível ao toque você tem três teclas. Em um instrumento de verdade teria mais teclas, mas o princípio é o mesmo.",
  "resultado": "A toca dó, B toca mi e o toque no logotipo toca sol.",
  "desafio": "Use os gestos para criar mais teclas: inclinar para a esquerda toca lá e para a direita toca si.",
  "aviso": null,
  "js": "input.onButtonPressed(Button.A, function () {\n    music.playTone(Note.C, music.beat(BeatFraction.Quarter))\n})\ninput.onButtonPressed(Button.B, function () {\n    music.playTone(Note.E, music.beat(BeatFraction.Quarter))\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    music.playTone(Note.G, music.beat(BeatFraction.Quarter))\n})\n",
  "py": "from microbit import *\nimport music\n\nwhile True:\n    if button_a.was_pressed():\n        music.pitch(262, 500)\n    if button_b.was_pressed():\n        music.pitch(330, 500)\n    if pin_logo.is_touched():\n        music.pitch(392, 500)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "C",
          "B": "Quarter"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "E",
          "B": "Quarter"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_logo",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "G",
          "B": "Quarter"
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 41,
  "modulo": 8,
  "n": 1,
  "nome": "Grupo e enviar número",
  "objetivo": "Escolha um grupo de rádio e envie um número sorteado ao apertar o botão A.",
  "conceito": "A micro:bit tem um rádio embutido: as placas conversam entre si sem fio, sem internet e sem cabo. Para conversarem, precisam estar no mesmo “grupo” (um número de 0 a 255), como a estação de rádio certa. Um evento de botão sorteia um número de 1 a 9 e o envia para o grupo.",
  "resultado": "Ao apertar A, a placa envia um número e mostra uma seta para o Leste, avisando que enviou.",
  "desafio": "Escolha um grupo só da sua turma (um número entre 2 e 255) para não misturar com as outras mesas.",
  "aviso": "Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.",
  "js": "radio.setGroup(1)\ninput.onButtonPressed(Button.A, function () {\n    radio.sendNumber(randint(1, 9))\n    basic.showArrow(ArrowNames.East)\n    basic.pause(500)\n    basic.clearScreen()\n})\n",
  "py": "from microbit import *\nimport radio\nimport random\n\nradio.on()\nradio.config(group=1)\n\nwhile True:\n    if button_a.was_pressed():\n        radio.send(str(random.randint(1, 9)))\n        display.show(Image.ARROW_E)\n        sleep(500)\n        display.clear()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_enviar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_aleatorio",
            "inputs": {
             "DE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             },
             "ATE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 9
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_seta",
           "fields": {
            "DIR": "East"
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 500
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_limpar_tela"
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 42,
  "modulo": 8,
  "n": 2,
  "nome": "Receber e mostrar",
  "objetivo": "Receba o número que a outra micro:bit enviou e mostre na tela.",
  "conceito": "Do outro lado, o programa fica esperando: “ao receber um número, faça isto”. O número que chegou vem dentro do bloco “número recebido”. Repare que quem envia e quem recebe usam o mesmo grupo.",
  "resultado": "Quando a outra placa envia um número, a tela desta placa mostra o mesmo número.",
  "desafio": "Grave este programa em uma placa e o da fase anterior em outra. Aperte A na primeira e veja a segunda responder.",
  "aviso": "Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.",
  "js": "radio.setGroup(1)\nradio.onReceivedNumber(function (receivedNumber) {\n    basic.showNumber(receivedNumber)\n})\n",
  "py": "from microbit import *\nimport radio\n\nradio.on()\nradio.config(group=1)\n\nwhile True:\n    pacote = radio.receive()\n    if pacote and pacote.lstrip(\"-\").isdigit():\n        display.scroll(int(pacote))\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_radio_ao_numero",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_radio_numero_recebido"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 43,
  "modulo": 8,
  "n": 3,
  "nome": "Enviar texto",
  "objetivo": "Envie a palavra “oi” pelo rádio ao apertar A e mostre os textos que chegarem.",
  "conceito": "O rádio também envia textos. Este programa faz os dois papéis: quando o botão A é apertado, envia o texto “oi”; quando chega um texto, mostra na tela. Grave o mesmo programa nas duas placas e as duas conversam.",
  "resultado": "Apertando A em uma placa, a outra mostra a palavra oi.",
  "desafio": "Troque “oi” pelo seu nome (sem acentos) e cumprimente um colega.",
  "aviso": "Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.",
  "js": "radio.setGroup(1)\ninput.onButtonPressed(Button.A, function () {\n    radio.sendString(\"oi\")\n})\nradio.onReceivedString(function (receivedString) {\n    basic.showString(receivedString)\n})\n",
  "py": "from microbit import *\nimport radio\n\nradio.on()\nradio.config(group=1)\n\nwhile True:\n    if button_a.was_pressed():\n        radio.send(\"oi\")\n    pacote = radio.receive()\n    if pacote:\n        display.scroll(pacote)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_enviar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "oi"
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_radio_ao_texto",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "mb_radio_texto_recebido"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 44,
  "modulo": 8,
  "n": 4,
  "nome": "Mensageiro com botões",
  "objetivo": "Use os botões como mensagens prontas: A envia SIM, B envia NAO e a outra placa mostra a resposta.",
  "conceito": "Um mensageiro tem mensagens prontas, uma para cada botão. O A envia o texto SIM e o B envia o texto NAO. Quem recebe mostra o texto que chegou. Com o mesmo programa nas duas placas, dá para conversar de longe usando só duas palavras.",
  "resultado": "Apertando A em uma placa, a outra mostra SIM; apertando B, mostra NAO.",
  "desafio": "Acrescente uma terceira mensagem para o logotipo: OI.",
  "aviso": "Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.",
  "js": "radio.setGroup(1)\ninput.onButtonPressed(Button.A, function () {\n    radio.sendString(\"SIM\")\n})\ninput.onButtonPressed(Button.B, function () {\n    radio.sendString(\"NAO\")\n})\nradio.onReceivedString(function (receivedString) {\n    basic.showString(receivedString)\n})\n",
  "py": "from microbit import *\nimport radio\n\nradio.on()\nradio.config(group=1)\n\nwhile True:\n    if button_a.was_pressed():\n        radio.send(\"SIM\")\n    if button_b.was_pressed():\n        radio.send(\"NAO\")\n    pacote = radio.receive()\n    if pacote:\n        display.scroll(pacote)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_enviar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "SIM"
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_enviar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "NAO"
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_radio_ao_texto",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_texto",
         "inputs": {
          "T": {
           "block": {
            "type": "mb_radio_texto_recebido"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 45,
  "modulo": 8,
  "n": 5,
  "nome": "Desafio: termômetro remoto",
  "objetivo": "Faça uma placa medir a temperatura e enviar pelo rádio, e a outra mostrar o valor recebido.",
  "conceito": "Um termômetro remoto é um sensor e uma tela em lugares diferentes. A placa que mede lê a temperatura e a envia a cada 2 segundos; a que mostra escuta o rádio e exibe o número que chegar. O mesmo programa nas duas placas faz cada uma mostrar a temperatura da outra.",
  "resultado": "Cada placa mostra, na tela, a temperatura medida pela outra placa, atualizada a cada 2 segundos.",
  "desafio": "Coloque uma placa em um lugar mais quente (perto da janela) e compare com a outra.",
  "aviso": "Você precisa de DUAS micro:bits V2 gravadas com programas do mesmo grupo de rádio (aqui, o grupo 1). Sem uma segunda placa, o programa roda, mas ninguém escuta.",
  "js": "radio.setGroup(1)\nbasic.forever(function () {\n    radio.sendNumber(input.temperature())\n    basic.pause(2000)\n})\nradio.onReceivedNumber(function (receivedNumber) {\n    basic.showNumber(receivedNumber)\n})\n",
  "py": "from microbit import *\nimport radio\n\nradio.on()\nradio.config(group=1)\n\nwhile True:\n    radio.send(str(temperature()))\n    sleep(2000)\n    pacote = radio.receive()\n    if pacote and pacote.lstrip(\"-\").isdigit():\n        display.scroll(int(pacote))\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_enviar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_temperatura"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 2000
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_radio_ao_numero",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_radio_numero_recebido"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 46,
  "modulo": 9,
  "n": 1,
  "nome": "Pedra, papel, tesoura",
  "objetivo": "Sacuda a micro:bit para sortear pedra, papel ou tesoura.",
  "conceito": "Um jogo precisa de sorte e de regras. A sorte vem do bloco “número aleatório”: ele sorteia 1, 2 ou 3. As regras são as decisões: se saiu 1, mostramos um losango (pedra); se saiu 2, um quadrado (papel); senão, a tesoura. Sacudir a placa é jogar.",
  "resultado": "A cada sacudida aparece um losango (pedra), um quadrado (papel) ou uma tesoura.",
  "desafio": "Jogue contra um colega: cada um sacode a sua placa ao mesmo tempo. Quem ganhou?",
  "aviso": null,
  "js": "let escolha = 0\nescolha = 0\ninput.onGesture(Gesture.Shake, function () {\n    escolha = randint(1, 3)\n    if (escolha == 1) {\n        basic.showIcon(IconNames.Diamond)\n    } else if (escolha == 2) {\n        basic.showIcon(IconNames.Square)\n    } else {\n        basic.showIcon(IconNames.Scissors)\n    }\n})\n",
  "py": "from microbit import *\nimport random\n\nescolha = 0\n\nwhile True:\n    if accelerometer.was_gesture(\"shake\"):\n        escolha = random.randint(1, 3)\n        if escolha == 1:\n            display.show(Image.DIAMOND)\n        elif escolha == 2:\n            display.show(Image.SQUARE)\n        else:\n            display.show(Image.SCISSORS)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_escolha"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "Shake"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_escolha"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_aleatorio",
            "inputs": {
             "DE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             },
             "ATE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 3
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "controls_if",
           "extraState": {
            "elseIfCount": 1,
            "hasElse": true
           },
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_compare",
              "fields": {
               "OP": "EQ"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "variables_get",
                 "fields": {
                  "VAR": {
                   "id": "v_escolha"
                  }
                 }
                }
               },
               "B": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 1
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_mostrar_icone",
              "fields": {
               "ICONE": "Diamond"
              }
             }
            },
            "IF1": {
             "block": {
              "type": "logic_compare",
              "fields": {
               "OP": "EQ"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "variables_get",
                 "fields": {
                  "VAR": {
                   "id": "v_escolha"
                  }
                 }
                }
               },
               "B": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 2
                 }
                }
               }
              }
             }
            },
            "DO1": {
             "block": {
              "type": "mb_mostrar_icone",
              "fields": {
               "ICONE": "Square"
              }
             }
            },
            "ELSE": {
             "block": {
              "type": "mb_mostrar_icone",
              "fields": {
               "ICONE": "Scissors"
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "escolha",
     "id": "v_escolha"
    }
   ]
  }
 },
 {
  "numero": 47,
  "modulo": 9,
  "n": 2,
  "nome": "Tempo de reação",
  "objetivo": "Meça quanto tempo você demora para apertar o botão B depois que a tela acende.",
  "conceito": "O relógio da micro:bit conta os milissegundos desde que ela ligou. Para medir o tempo de reação: anotamos a hora em que a tela acendeu, esperamos o aperto do botão B e subtraímos. A espera é feita pelo laço “enquanto”: ele repete até o botão ser apertado.",
  "resultado": "Aperte A: após uma espera surpresa, a tela acende. Aperte B o mais rápido que puder e veja seu tempo em milissegundos.",
  "desafio": "Faça o jogo avisar “cedo demais” se o B for apertado antes da tela acender.",
  "aviso": null,
  "js": "let inicio = 0\nlet reacao = 0\ninput.onButtonPressed(Button.A, function () {\n    basic.clearScreen()\n    basic.pause(randint(2000, 5000))\n    basic.showIcon(IconNames.Square)\n    inicio = input.runningTime()\n    while (!input.buttonIsPressed(Button.B)) {\n        basic.pause(1)\n    }\n    reacao = input.runningTime() - inicio\n    basic.showNumber(reacao)\n})\n",
  "py": "from microbit import *\nimport random\n\ninicio = 0\nreacao = 0\n\nwhile True:\n    if button_a.was_pressed():\n        display.clear()\n        sleep(random.randint(2000, 5000))\n        display.show(Image.SQUARE)\n        inicio = running_time()\n        while not button_b.is_pressed():\n            sleep(1)\n        reacao = running_time() - inicio\n        display.scroll(reacao)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_limpar_tela",
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "mb_aleatorio",
              "inputs": {
               "DE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 2000
                 }
                }
               },
               "ATE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 5000
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_mostrar_icone",
             "fields": {
              "ICONE": "Square"
             },
             "next": {
              "block": {
               "type": "mb_var_definir",
               "fields": {
                "VAR": {
                 "id": "v_inicio"
                }
               },
               "inputs": {
                "VALOR": {
                 "block": {
                  "type": "mb_tempo"
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_enquanto",
                 "inputs": {
                  "C": {
                   "block": {
                    "type": "logic_negate",
                    "inputs": {
                     "BOOL": {
                      "block": {
                       "type": "mb_botao_pressionado",
                       "fields": {
                        "BTN": "B"
                       }
                      }
                     }
                    }
                   }
                  },
                  "DO": {
                   "block": {
                    "type": "mb_pausa",
                    "inputs": {
                     "MS": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_var_definir",
                   "fields": {
                    "VAR": {
                     "id": "v_reacao"
                    }
                   },
                   "inputs": {
                    "VALOR": {
                     "block": {
                      "type": "math_arithmetic",
                      "fields": {
                       "OP": "MINUS"
                      },
                      "inputs": {
                       "A": {
                        "block": {
                         "type": "mb_tempo"
                        }
                       },
                       "B": {
                        "block": {
                         "type": "variables_get",
                         "fields": {
                          "VAR": {
                           "id": "v_inicio"
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "mb_mostrar_numero",
                     "inputs": {
                      "N": {
                       "block": {
                        "type": "variables_get",
                        "fields": {
                         "VAR": {
                          "id": "v_reacao"
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "inicio",
     "id": "v_inicio"
    },
    {
     "name": "reacao",
     "id": "v_reacao"
    }
   ]
  }
 },
 {
  "numero": 48,
  "modulo": 9,
  "n": 3,
  "nome": "Nave espacial",
  "objetivo": "Desvie de um asteroide que cai: A e B movem a nave e, se ele acertar, o jogo termina.",
  "conceito": "A nave é um ponto aceso na linha de baixo; a variável x guarda a coluna dela (0 a 4). O botão A anda para a esquerda e o B para a direita, sem sair da tela. O asteroide cai uma linha por vez (fy) em uma coluna sorteada (fx). Se ele chega embaixo na mesma coluna da nave, é a colisão: aparece uma caveira, o jogo mostra os pontos e recomeça. Se não, você ganha 1 ponto.",
  "resultado": "Um asteroide cai. Desviando, você soma pontos; se ele acertar a nave, aparece uma caveira, mostra os pontos e o jogo recomeça.",
  "desafio": "Faça o asteroide cair mais rápido a cada ponto.",
  "aviso": null,
  "js": "let x = 0\nlet fx = 0\nlet fy = 0\nlet pontos = 0\nx = 2\nfx = randint(0, 4)\nfy = 0\npontos = 0\ninput.onButtonPressed(Button.A, function () {\n    if (x > 0) {\n        x += -1\n    }\n})\ninput.onButtonPressed(Button.B, function () {\n    if (x < 4) {\n        x += 1\n    }\n})\nbasic.forever(function () {\n    basic.clearScreen()\n    led.plot(x, 4)\n    led.plot(fx, fy)\n    basic.pause(300)\n    fy += 1\n    if (fy > 4) {\n        if (fx == x) {\n            basic.showIcon(IconNames.Skull)\n            basic.pause(1500)\n            basic.showNumber(pontos)\n            pontos = 0\n        } else {\n            pontos += 1\n        }\n        fy = 0\n        fx = randint(0, 4)\n    }\n})\n",
  "py": "from microbit import *\nimport random\n\nx = 2\nfx = random.randint(0, 4)\nfy = 0\npontos = 0\n\nwhile True:\n    if button_a.was_pressed():\n        if x > 0:\n            x += -1\n    if button_b.was_pressed():\n        if x < 4:\n            x += 1\n    display.clear()\n    display.set_pixel(x, 4, 9)\n    display.set_pixel(fx, fy, 9)\n    sleep(300)\n    fy += 1\n    if fy > 4:\n        if fx == x:\n            display.show(Image.SKULL)\n            sleep(1500)\n            display.scroll(pontos)\n            pontos = 0\n        else:\n            pontos += 1\n        fy = 0\n        fx = random.randint(0, 4)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_x"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 2
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_fx"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "mb_aleatorio",
              "inputs": {
               "DE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 0
                 }
                }
               },
               "ATE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 4
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_fy"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_var_definir",
               "fields": {
                "VAR": {
                 "id": "v_pontos"
                }
               },
               "inputs": {
                "VALOR": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "GT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_x"
                }
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_var_mudar",
            "fields": {
             "VAR": {
              "id": "v_x"
             }
            },
            "inputs": {
             "VALOR": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": -1
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "LT"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_x"
                }
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 4
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_var_mudar",
            "fields": {
             "VAR": {
              "id": "v_x"
             }
            },
            "inputs": {
             "VALOR": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_limpar_tela",
         "next": {
          "block": {
           "type": "mb_acender",
           "inputs": {
            "X": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_x"
               }
              }
             }
            },
            "Y": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 4
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_acender",
             "inputs": {
              "X": {
               "block": {
                "type": "variables_get",
                "fields": {
                 "VAR": {
                  "id": "v_fx"
                 }
                }
               }
              },
              "Y": {
               "block": {
                "type": "variables_get",
                "fields": {
                 "VAR": {
                  "id": "v_fy"
                 }
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 300
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_var_mudar",
                 "fields": {
                  "VAR": {
                   "id": "v_fy"
                  }
                 },
                 "inputs": {
                  "VALOR": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 1
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "controls_if",
                   "inputs": {
                    "IF0": {
                     "block": {
                      "type": "logic_compare",
                      "fields": {
                       "OP": "GT"
                      },
                      "inputs": {
                       "A": {
                        "block": {
                         "type": "variables_get",
                         "fields": {
                          "VAR": {
                           "id": "v_fy"
                          }
                         }
                        }
                       },
                       "B": {
                        "block": {
                         "type": "math_number",
                         "fields": {
                          "NUM": 4
                         }
                        }
                       }
                      }
                     }
                    },
                    "DO0": {
                     "block": {
                      "type": "controls_if",
                      "inputs": {
                       "IF0": {
                        "block": {
                         "type": "logic_compare",
                         "fields": {
                          "OP": "EQ"
                         },
                         "inputs": {
                          "A": {
                           "block": {
                            "type": "variables_get",
                            "fields": {
                             "VAR": {
                              "id": "v_fx"
                             }
                            }
                           }
                          },
                          "B": {
                           "block": {
                            "type": "variables_get",
                            "fields": {
                             "VAR": {
                              "id": "v_x"
                             }
                            }
                           }
                          }
                         }
                        }
                       },
                       "DO0": {
                        "block": {
                         "type": "mb_mostrar_icone",
                         "fields": {
                          "ICONE": "Skull"
                         },
                         "next": {
                          "block": {
                           "type": "mb_pausa",
                           "inputs": {
                            "MS": {
                             "block": {
                              "type": "math_number",
                              "fields": {
                               "NUM": 1500
                              }
                             }
                            }
                           },
                           "next": {
                            "block": {
                             "type": "mb_mostrar_numero",
                             "inputs": {
                              "N": {
                               "block": {
                                "type": "variables_get",
                                "fields": {
                                 "VAR": {
                                  "id": "v_pontos"
                                 }
                                }
                               }
                              }
                             },
                             "next": {
                              "block": {
                               "type": "mb_var_definir",
                               "fields": {
                                "VAR": {
                                 "id": "v_pontos"
                                }
                               },
                               "inputs": {
                                "VALOR": {
                                 "block": {
                                  "type": "math_number",
                                  "fields": {
                                   "NUM": 0
                                  }
                                 }
                                }
                               }
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       },
                       "ELSE": {
                        "block": {
                         "type": "mb_var_mudar",
                         "fields": {
                          "VAR": {
                           "id": "v_pontos"
                          }
                         },
                         "inputs": {
                          "VALOR": {
                           "block": {
                            "type": "math_number",
                            "fields": {
                             "NUM": 1
                            }
                           }
                          }
                         }
                        }
                       }
                      },
                      "extraState": {
                       "hasElse": true
                      },
                      "next": {
                       "block": {
                        "type": "mb_var_definir",
                        "fields": {
                         "VAR": {
                          "id": "v_fy"
                         }
                        },
                        "inputs": {
                         "VALOR": {
                          "block": {
                           "type": "math_number",
                           "fields": {
                            "NUM": 0
                           }
                          }
                         }
                        },
                        "next": {
                         "block": {
                          "type": "mb_var_definir",
                          "fields": {
                           "VAR": {
                            "id": "v_fx"
                           }
                          },
                          "inputs": {
                           "VALOR": {
                            "block": {
                             "type": "mb_aleatorio",
                             "inputs": {
                              "DE": {
                               "block": {
                                "type": "math_number",
                                "fields": {
                                 "NUM": 0
                                }
                               }
                              },
                              "ATE": {
                               "block": {
                                "type": "math_number",
                                "fields": {
                                 "NUM": 4
                                }
                               }
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "fx",
     "id": "v_fx"
    },
    {
     "name": "fy",
     "id": "v_fy"
    },
    {
     "name": "pontos",
     "id": "v_pontos"
    },
    {
     "name": "x",
     "id": "v_x"
    }
   ]
  }
 },
 {
  "numero": 49,
  "modulo": 9,
  "n": 4,
  "nome": "Pegue a fruta",
  "objetivo": "Pegue as frutas que caem do alto da tela inclinando a placa para mover o cesto, e conte os pontos.",
  "conceito": "Aqui o controle é o acelerômetro: inclinar a placa para os lados move o cesto (a coluna x) pela linha de baixo. Uma fruta cai uma linha por vez, em uma coluna sorteada. Se ela chega embaixo na mesma coluna do cesto, você ganha um ponto; senão, ela some e outra nasce. O botão A mostra os pontos.",
  "resultado": "Uma fruta cai. Inclinando a placa você move o cesto; se pegar a fruta, o placar sobe 1. O botão A mostra os pontos.",
  "desafio": "Faça a fruta cair mais rápido a cada ponto conseguido.",
  "aviso": null,
  "js": "let x = 0\nlet fx = 0\nlet fy = 0\nlet pontos = 0\nx = 2\nfx = randint(0, 4)\nfy = 0\npontos = 0\ninput.onButtonPressed(Button.A, function () {\n    basic.showNumber(pontos)\n})\nbasic.forever(function () {\n    x = Math.constrain(pins.map(input.acceleration(Dimension.X), -1000, 1000, 0, 4), 0, 4)\n    basic.clearScreen()\n    led.plot(x, 4)\n    led.plot(fx, fy)\n    basic.pause(250)\n    fy += 1\n    if (fy > 4) {\n        if (fx == x) {\n            pontos += 1\n        }\n        fy = 0\n        fx = randint(0, 4)\n    }\n})\n",
  "py": "from microbit import *\nimport random\n\ndef mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)\n\nx = 2\nfx = random.randint(0, 4)\nfy = 0\npontos = 0\n\nwhile True:\n    if button_a.was_pressed():\n        display.scroll(pontos)\n    x = max(0, min(4, mapear(accelerometer.get_x(), -1000, 1000, 0, 4)))\n    display.clear()\n    display.set_pixel(x, 4, 9)\n    display.set_pixel(fx, fy, 9)\n    sleep(250)\n    fy += 1\n    if fy > 4:\n        if fx == x:\n            pontos += 1\n        fy = 0\n        fx = random.randint(0, 4)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_x"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 2
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_fx"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "mb_aleatorio",
              "inputs": {
               "DE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 0
                 }
                }
               },
               "ATE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 4
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_fy"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_var_definir",
               "fields": {
                "VAR": {
                 "id": "v_pontos"
                }
               },
               "inputs": {
                "VALOR": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "variables_get",
            "fields": {
             "VAR": {
              "id": "v_pontos"
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_x"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_restringir",
            "inputs": {
             "V": {
              "block": {
               "type": "mb_mapear",
               "inputs": {
                "V": {
                 "block": {
                  "type": "mb_aceleracao",
                  "fields": {
                   "D": "X"
                  }
                 }
                },
                "A": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": -1000
                  }
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                },
                "C": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                },
                "D": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 4
                  }
                 }
                }
               }
              }
             },
             "MIN": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "MAX": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 4
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_limpar_tela",
           "next": {
            "block": {
             "type": "mb_acender",
             "inputs": {
              "X": {
               "block": {
                "type": "variables_get",
                "fields": {
                 "VAR": {
                  "id": "v_x"
                 }
                }
               }
              },
              "Y": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 4
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_acender",
               "inputs": {
                "X": {
                 "block": {
                  "type": "variables_get",
                  "fields": {
                   "VAR": {
                    "id": "v_fx"
                   }
                  }
                 }
                },
                "Y": {
                 "block": {
                  "type": "variables_get",
                  "fields": {
                   "VAR": {
                    "id": "v_fy"
                   }
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_pausa",
                 "inputs": {
                  "MS": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 250
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_var_mudar",
                   "fields": {
                    "VAR": {
                     "id": "v_fy"
                    }
                   },
                   "inputs": {
                    "VALOR": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 1
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "controls_if",
                     "inputs": {
                      "IF0": {
                       "block": {
                        "type": "logic_compare",
                        "fields": {
                         "OP": "GT"
                        },
                        "inputs": {
                         "A": {
                          "block": {
                           "type": "variables_get",
                           "fields": {
                            "VAR": {
                             "id": "v_fy"
                            }
                           }
                          }
                         },
                         "B": {
                          "block": {
                           "type": "math_number",
                           "fields": {
                            "NUM": 4
                           }
                          }
                         }
                        }
                       }
                      },
                      "DO0": {
                       "block": {
                        "type": "controls_if",
                        "inputs": {
                         "IF0": {
                          "block": {
                           "type": "logic_compare",
                           "fields": {
                            "OP": "EQ"
                           },
                           "inputs": {
                            "A": {
                             "block": {
                              "type": "variables_get",
                              "fields": {
                               "VAR": {
                                "id": "v_fx"
                               }
                              }
                             }
                            },
                            "B": {
                             "block": {
                              "type": "variables_get",
                              "fields": {
                               "VAR": {
                                "id": "v_x"
                               }
                              }
                             }
                            }
                           }
                          }
                         },
                         "DO0": {
                          "block": {
                           "type": "mb_var_mudar",
                           "fields": {
                            "VAR": {
                             "id": "v_pontos"
                            }
                           },
                           "inputs": {
                            "VALOR": {
                             "block": {
                              "type": "math_number",
                              "fields": {
                               "NUM": 1
                              }
                             }
                            }
                           }
                          }
                         }
                        },
                        "next": {
                         "block": {
                          "type": "mb_var_definir",
                          "fields": {
                           "VAR": {
                            "id": "v_fy"
                           }
                          },
                          "inputs": {
                           "VALOR": {
                            "block": {
                             "type": "math_number",
                             "fields": {
                              "NUM": 0
                             }
                            }
                           }
                          },
                          "next": {
                           "block": {
                            "type": "mb_var_definir",
                            "fields": {
                             "VAR": {
                              "id": "v_fx"
                             }
                            },
                            "inputs": {
                             "VALOR": {
                              "block": {
                               "type": "mb_aleatorio",
                               "inputs": {
                                "DE": {
                                 "block": {
                                  "type": "math_number",
                                  "fields": {
                                   "NUM": 0
                                  }
                                 }
                                },
                                "ATE": {
                                 "block": {
                                  "type": "math_number",
                                  "fields": {
                                   "NUM": 4
                                  }
                                 }
                                }
                               }
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "fx",
     "id": "v_fx"
    },
    {
     "name": "fy",
     "id": "v_fy"
    },
    {
     "name": "pontos",
     "id": "v_pontos"
    },
    {
     "name": "x",
     "id": "v_x"
    }
   ]
  }
 },
 {
  "numero": 50,
  "modulo": 9,
  "n": 5,
  "nome": "Desafio: pedra, papel, tesoura por rádio",
  "objetivo": "Jogue pedra, papel e tesoura contra outra micro:bit, com placar de vitórias.",
  "conceito": "Cada jogador sacode a placa: ela sorteia 1, 2 ou 3 e envia o número ao adversário pelo rádio. Quando chega o número dele, comparamos: a conta (minha − dele + 3) dividida por 3 deixa resto 0 para empate, 1 para vitória e 2 para derrota. É uma regra do jogo escrita em matemática! Cada vitória soma 1 no placar; o botão A mostra o placar.",
  "resultado": "Sacudindo as duas placas, cada uma mostra rosto feliz se ganhou, rosto triste se perdeu, ou um sinal de igual (=) se empatou. O botão A mostra suas vitórias.",
  "desafio": "Mostre primeiro o que você jogou e o que o adversário jogou, e só depois o resultado.",
  "aviso": "Precisa de DUAS micro:bits V2 com este mesmo programa, e as duas devem ser sacudidas quase juntas. Números: 1 = pedra, 2 = papel, 3 = tesoura.",
  "js": "let minha = 0\nlet dele = 0\nlet vitorias = 0\nlet resultado = 0\nradio.setGroup(7)\nminha = 0\ndele = 0\nvitorias = 0\ninput.onGesture(Gesture.Shake, function () {\n    minha = randint(1, 3)\n    radio.sendNumber(minha)\n    if (minha == 1) {\n        basic.showIcon(IconNames.Diamond)\n    } else if (minha == 2) {\n        basic.showIcon(IconNames.Square)\n    } else {\n        basic.showIcon(IconNames.Scissors)\n    }\n})\nradio.onReceivedNumber(function (receivedNumber) {\n    dele = receivedNumber\n    basic.pause(1500)\n    resultado = ((minha - dele) + 3) % 3\n    if (resultado == 0) {\n        basic.showString(\"=\")\n    } else if (resultado == 1) {\n        vitorias += 1\n        basic.showIcon(IconNames.Happy)\n    } else {\n        basic.showIcon(IconNames.Sad)\n    }\n})\ninput.onButtonPressed(Button.A, function () {\n    basic.showNumber(vitorias)\n})\n",
  "py": "from microbit import *\nimport radio\nimport random\n\nresultado = 0\nradio.on()\nradio.config(group=7)\nminha = 0\ndele = 0\nvitorias = 0\n\nwhile True:\n    if accelerometer.was_gesture(\"shake\"):\n        minha = random.randint(1, 3)\n        radio.send(str(minha))\n        if minha == 1:\n            display.show(Image.DIAMOND)\n        elif minha == 2:\n            display.show(Image.SQUARE)\n        else:\n            display.show(Image.SCISSORS)\n    pacote = radio.receive()\n    if pacote and pacote.lstrip(\"-\").isdigit():\n        dele = int(pacote)\n        sleep(1500)\n        resultado = ((minha - dele) + 3) % 3\n        if resultado == 0:\n            display.scroll(\"=\")\n        elif resultado == 1:\n            vitorias += 1\n            display.show(Image.HAPPY)\n        else:\n            display.show(Image.SAD)\n    if button_a.was_pressed():\n        display.scroll(vitorias)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_radio_grupo",
         "inputs": {
          "G": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 7
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_minha"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_dele"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_var_definir",
               "fields": {
                "VAR": {
                 "id": "v_vitorias"
                }
               },
               "inputs": {
                "VALOR": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "Shake"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_minha"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_aleatorio",
            "inputs": {
             "DE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             },
             "ATE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 3
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_radio_enviar_numero",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_minha"
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "controls_if",
             "extraState": {
              "elseIfCount": 1,
              "hasElse": true
             },
             "inputs": {
              "IF0": {
               "block": {
                "type": "logic_compare",
                "fields": {
                 "OP": "EQ"
                },
                "inputs": {
                 "A": {
                  "block": {
                   "type": "variables_get",
                   "fields": {
                    "VAR": {
                     "id": "v_minha"
                    }
                   }
                  }
                 },
                 "B": {
                  "block": {
                   "type": "math_number",
                   "fields": {
                    "NUM": 1
                   }
                  }
                 }
                }
               }
              },
              "DO0": {
               "block": {
                "type": "mb_mostrar_icone",
                "fields": {
                 "ICONE": "Diamond"
                }
               }
              },
              "IF1": {
               "block": {
                "type": "logic_compare",
                "fields": {
                 "OP": "EQ"
                },
                "inputs": {
                 "A": {
                  "block": {
                   "type": "variables_get",
                   "fields": {
                    "VAR": {
                     "id": "v_minha"
                    }
                   }
                  }
                 },
                 "B": {
                  "block": {
                   "type": "math_number",
                   "fields": {
                    "NUM": 2
                   }
                  }
                 }
                }
               }
              },
              "DO1": {
               "block": {
                "type": "mb_mostrar_icone",
                "fields": {
                 "ICONE": "Square"
                }
               }
              },
              "ELSE": {
               "block": {
                "type": "mb_mostrar_icone",
                "fields": {
                 "ICONE": "Scissors"
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_radio_ao_numero",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_dele"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_radio_numero_recebido"
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1500
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_resultado"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_modulo",
                "inputs": {
                 "DIVIDEND": {
                  "block": {
                   "type": "math_arithmetic",
                   "fields": {
                    "OP": "ADD"
                   },
                   "inputs": {
                    "A": {
                     "block": {
                      "type": "math_arithmetic",
                      "fields": {
                       "OP": "MINUS"
                      },
                      "inputs": {
                       "A": {
                        "block": {
                         "type": "variables_get",
                         "fields": {
                          "VAR": {
                           "id": "v_minha"
                          }
                         }
                        }
                       },
                       "B": {
                        "block": {
                         "type": "variables_get",
                         "fields": {
                          "VAR": {
                           "id": "v_dele"
                          }
                         }
                        }
                       }
                      }
                     }
                    },
                    "B": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 3
                      }
                     }
                    }
                   }
                  }
                 },
                 "DIVISOR": {
                  "block": {
                   "type": "math_number",
                   "fields": {
                    "NUM": 3
                   }
                  }
                 }
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "controls_if",
               "extraState": {
                "elseIfCount": 1,
                "hasElse": true
               },
               "inputs": {
                "IF0": {
                 "block": {
                  "type": "logic_compare",
                  "fields": {
                   "OP": "EQ"
                  },
                  "inputs": {
                   "A": {
                    "block": {
                     "type": "variables_get",
                     "fields": {
                      "VAR": {
                       "id": "v_resultado"
                      }
                     }
                    }
                   },
                   "B": {
                    "block": {
                     "type": "math_number",
                     "fields": {
                      "NUM": 0
                     }
                    }
                   }
                  }
                 }
                },
                "DO0": {
                 "block": {
                  "type": "mb_mostrar_texto",
                  "inputs": {
                   "T": {
                    "block": {
                     "type": "text",
                     "fields": {
                      "TEXT": "="
                     }
                    }
                   }
                  }
                 }
                },
                "IF1": {
                 "block": {
                  "type": "logic_compare",
                  "fields": {
                   "OP": "EQ"
                  },
                  "inputs": {
                   "A": {
                    "block": {
                     "type": "variables_get",
                     "fields": {
                      "VAR": {
                       "id": "v_resultado"
                      }
                     }
                    }
                   },
                   "B": {
                    "block": {
                     "type": "math_number",
                     "fields": {
                      "NUM": 1
                     }
                    }
                   }
                  }
                 }
                },
                "DO1": {
                 "block": {
                  "type": "mb_var_mudar",
                  "fields": {
                   "VAR": {
                    "id": "v_vitorias"
                   }
                  },
                  "inputs": {
                   "VALOR": {
                    "block": {
                     "type": "math_number",
                     "fields": {
                      "NUM": 1
                     }
                    }
                   }
                  },
                  "next": {
                   "block": {
                    "type": "mb_mostrar_icone",
                    "fields": {
                     "ICONE": "Happy"
                    }
                   }
                  }
                 }
                },
                "ELSE": {
                 "block": {
                  "type": "mb_mostrar_icone",
                  "fields": {
                   "ICONE": "Sad"
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "variables_get",
            "fields": {
             "VAR": {
              "id": "v_vitorias"
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "dele",
     "id": "v_dele"
    },
    {
     "name": "minha",
     "id": "v_minha"
    },
    {
     "name": "resultado",
     "id": "v_resultado"
    },
    {
     "name": "vitorias",
     "id": "v_vitorias"
    }
   ]
  }
 },
 {
  "numero": 51,
  "modulo": 10,
  "n": 1,
  "nome": "Acender um LED",
  "objetivo": "Acenda o LED vermelho ligado à micro:bit.",
  "conceito": "Um pino digital é como um interruptor: 1 liga (3,3 V) e 0 desliga (0 V). Ligando um LED em um pino, com um resistor para proteger, escrever 1 no pino acende o LED. Alguns pinos também são usados pela tela de LEDs da placa, por isso desligamos a tela antes de usá-los.",
  "resultado": "O LED vermelho externo acende e fica aceso.",
  "desafio": "Acenda o LED amarelo em vez do vermelho. Depois acenda os três.",
  "aviso": "Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\npins.digitalWritePin(DigitalPin.P13, 1)\n",
  "py": "from microbit import *\n\ndisplay.off()\npin13.write_digital(1)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_escrever_digital",
           "fields": {
            "P": "P13"
           },
           "inputs": {
            "V": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 52,
  "modulo": 10,
  "n": 2,
  "nome": "Piscar",
  "objetivo": "Faça o LED vermelho piscar: 1 segundo aceso e 1 segundo apagado.",
  "conceito": "Piscar é ligar, esperar, desligar e esperar de novo, para sempre. O laço “sempre” faz essa repetição. A pausa entre os dois estados dá o ritmo: pausas curtas piscam rápido, pausas longas piscam devagar.",
  "resultado": "O LED vermelho acende por 1 segundo e apaga por 1 segundo, repetindo sem parar.",
  "desafio": "Faça o LED piscar 5 vezes por segundo (pausas de 100 ms).",
  "aviso": "Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\nbasic.forever(function () {\n    pins.digitalWritePin(DigitalPin.P13, 1)\n    basic.pause(1000)\n    pins.digitalWritePin(DigitalPin.P13, 0)\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\n\nwhile True:\n    pin13.write_digital(1)\n    sleep(1000)\n    pin13.write_digital(0)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_digital",
         "fields": {
          "P": "P13"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_digital",
             "fields": {
              "P": "P13"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 53,
  "modulo": 10,
  "n": 3,
  "nome": "Semáforo com 3 LEDs",
  "objetivo": "Monte um semáforo com os LEDs vermelho, amarelo e verde.",
  "conceito": "Um semáforo é uma sequência de estados: verde por um tempo, amarelo por um tempo curto e vermelho por outro tempo. Em cada estado, acendemos um LED e apagamos os outros. Repare que o programa é só uma lista de passos, executada na ordem.",
  "resultado": "Verde (3 s), amarelo (1 s), vermelho (3 s), e o ciclo se repete.",
  "desafio": "Faça o amarelo piscar 3 vezes antes de o vermelho acender.",
  "aviso": "Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\nbasic.forever(function () {\n    pins.digitalWritePin(DigitalPin.P13, 0)\n    pins.digitalWritePin(DigitalPin.P14, 0)\n    pins.digitalWritePin(DigitalPin.P15, 1)\n    basic.pause(3000)\n    pins.digitalWritePin(DigitalPin.P15, 0)\n    pins.digitalWritePin(DigitalPin.P14, 1)\n    basic.pause(1000)\n    pins.digitalWritePin(DigitalPin.P14, 0)\n    pins.digitalWritePin(DigitalPin.P13, 1)\n    basic.pause(3000)\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\n\nwhile True:\n    pin13.write_digital(0)\n    pin14.write_digital(0)\n    pin15.write_digital(1)\n    sleep(3000)\n    pin15.write_digital(0)\n    pin14.write_digital(1)\n    sleep(1000)\n    pin14.write_digital(0)\n    pin13.write_digital(1)\n    sleep(3000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_digital",
         "fields": {
          "P": "P13"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_escrever_digital",
           "fields": {
            "P": "P14"
           },
           "inputs": {
            "V": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_digital",
             "fields": {
              "P": "P15"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 3000
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_escrever_digital",
                 "fields": {
                  "P": "P15"
                 },
                 "inputs": {
                  "V": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 0
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_escrever_digital",
                   "fields": {
                    "P": "P14"
                   },
                   "inputs": {
                    "V": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 1
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "mb_pausa",
                     "inputs": {
                      "MS": {
                       "block": {
                        "type": "math_number",
                        "fields": {
                         "NUM": 1000
                        }
                       }
                      }
                     },
                     "next": {
                      "block": {
                       "type": "mb_escrever_digital",
                       "fields": {
                        "P": "P14"
                       },
                       "inputs": {
                        "V": {
                         "block": {
                          "type": "math_number",
                          "fields": {
                           "NUM": 0
                          }
                         }
                        }
                       },
                       "next": {
                        "block": {
                         "type": "mb_escrever_digital",
                         "fields": {
                          "P": "P13"
                         },
                         "inputs": {
                          "V": {
                           "block": {
                            "type": "math_number",
                            "fields": {
                             "NUM": 1
                            }
                           }
                          }
                         },
                         "next": {
                          "block": {
                           "type": "mb_pausa",
                           "inputs": {
                            "MS": {
                             "block": {
                              "type": "math_number",
                              "fields": {
                               "NUM": 3000
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 54,
  "modulo": 10,
  "n": 4,
  "nome": "Brilho com PWM",
  "objetivo": "Controle o brilho do LED amarelo em três níveis: fraco, médio e forte.",
  "conceito": "Um pino pode “fingir” valores entre ligado e desligado ligando e desligando muito rápido: isso se chama PWM. No pino analógico o valor vai de 0 (apagado) a 1023 (brilho máximo). Com 100, 500 e 1023 o LED aparece em três níveis de brilho.",
  "resultado": "O LED amarelo fica fraco por 1 segundo, depois médio, depois forte, e o ciclo se repete.",
  "desafio": "Acrescente um quarto nível e teste valores diferentes: o brilho sobe de forma uniforme?",
  "aviso": "Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\nbasic.forever(function () {\n    pins.analogWritePin(AnalogPin.P14, 100)\n    basic.pause(1000)\n    pins.analogWritePin(AnalogPin.P14, 500)\n    basic.pause(1000)\n    pins.analogWritePin(AnalogPin.P14, 1023)\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\n\nwhile True:\n    pin14.write_analog(100)\n    sleep(1000)\n    pin14.write_analog(500)\n    sleep(1000)\n    pin14.write_analog(1023)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_analogico",
         "fields": {
          "P": "P14"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 100
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_analogico",
             "fields": {
              "P": "P14"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 500
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_escrever_analogico",
                 "fields": {
                  "P": "P14"
                 },
                 "inputs": {
                  "V": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 1023
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 1000
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 55,
  "modulo": 10,
  "n": 5,
  "nome": "Desafio: LED que respira",
  "objetivo": "Faça o brilho do LED vermelho subir e descer suavemente, como uma respiração.",
  "conceito": "Um efeito é uma sequência que se repete. Contando de 0 a 20 e multiplicando por 50, o brilho sobe em degraus finos; depois desce pelo caminho inverso (1000 − i × 50). Com uma pausa curta entre os passos, o olho vê uma subida suave.",
  "resultado": "O LED vai de apagado a bem brilhante e volta, suavemente, sem parar.",
  "desafio": "Deixe a respiração mais lenta aumentando a pausa de 20 para 60 ms. Depois faça os três LEDs respirarem em sequência.",
  "aviso": "Ligue cada LED com um resistor de 220 Ω em série: pino da micro:bit → resistor → perna comprida (+) do LED → perna curta (−) no GND. Estes pinos dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro.",
  "js": "let i = 0\nled.enable(false)\nbasic.forever(function () {\n    for (let i = 0; i <= 20; i++) {\n        pins.analogWritePin(AnalogPin.P13, i * 50)\n        basic.pause(20)\n    }\n    for (let i = 0; i <= 20; i++) {\n        pins.analogWritePin(AnalogPin.P13, 1000 - i * 50)\n        basic.pause(20)\n    }\n})\n",
  "py": "from microbit import *\n\ni = 0\ndisplay.off()\n\nwhile True:\n    for i in range(21):\n        pin13.write_analog(i * 50)\n        sleep(20)\n    for i in range(21):\n        pin13.write_analog(1000 - i * 50)\n        sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_para",
         "fields": {
          "VAR": {
           "id": "v_i"
          }
         },
         "inputs": {
          "ATE": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 20
            }
           }
          },
          "DO": {
           "block": {
            "type": "mb_escrever_analogico",
            "fields": {
             "P": "P13"
            },
            "inputs": {
             "V": {
              "block": {
               "type": "math_arithmetic",
               "fields": {
                "OP": "MULTIPLY"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "variables_get",
                  "fields": {
                   "VAR": {
                    "id": "v_i"
                   }
                  }
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 50
                  }
                 }
                }
               }
              }
             }
            },
            "next": {
             "block": {
              "type": "mb_pausa",
              "inputs": {
               "MS": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 20
                 }
                }
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_para",
           "fields": {
            "VAR": {
             "id": "v_i"
            }
           },
           "inputs": {
            "ATE": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 20
              }
             }
            },
            "DO": {
             "block": {
              "type": "mb_escrever_analogico",
              "fields": {
               "P": "P13"
              },
              "inputs": {
               "V": {
                "block": {
                 "type": "math_arithmetic",
                 "fields": {
                  "OP": "MINUS"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 1000
                    }
                   }
                  },
                  "B": {
                   "block": {
                    "type": "math_arithmetic",
                    "fields": {
                     "OP": "MULTIPLY"
                    },
                    "inputs": {
                     "A": {
                      "block": {
                       "type": "variables_get",
                       "fields": {
                        "VAR": {
                         "id": "v_i"
                        }
                       }
                      }
                     },
                     "B": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 50
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              },
              "next": {
               "block": {
                "type": "mb_pausa",
                "inputs": {
                 "MS": {
                  "block": {
                   "type": "math_number",
                   "fields": {
                    "NUM": 20
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "i",
     "id": "v_i"
    }
   ]
  }
 },
 {
  "numero": 56,
  "modulo": 11,
  "n": 1,
  "nome": "Ler o botão",
  "objetivo": "Mostre um rosto feliz enquanto o botão externo estiver apertado.",
  "conceito": "Um botão é uma chave: apertado, liga dois fios. Com o resistor de pull-up ligado (por dentro da micro:bit), o pino fica em 1 quando o botão está solto e vai para 0 quando ele é apertado. Ler o pino é perguntar “ele está em 0?”.",
  "resultado": "Enquanto o botão externo está apertado aparece um rosto feliz; ao soltar, a tela apaga.",
  "desafio": "Inverta: mostre o rosto feliz quando o botão estiver SOLTO.",
  "aviso": "Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado.",
  "js": "pins.setPull(DigitalPin.P8, PinPullMode.PullUp)\nbasic.forever(function () {\n    if (pins.digitalReadPin(DigitalPin.P8) == 0) {\n        basic.showIcon(IconNames.Happy)\n    } else {\n        basic.clearScreen()\n    }\n})\n",
  "py": "from microbit import *\n\npin8.set_pull(pin8.PULL_UP)\n\nwhile True:\n    if pin8.read_digital() == 0:\n        display.show(Image.HAPPY)\n    else:\n        display.clear()\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_puxar_pino",
         "fields": {
          "P": "P8",
          "PULL": "UP"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "EQ"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_ler_digital",
               "fields": {
                "P": "P8"
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_mostrar_icone",
            "fields": {
             "ICONE": "Happy"
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_limpar_tela"
           }
          }
         },
         "extraState": {
          "hasElse": true
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 57,
  "modulo": 11,
  "n": 2,
  "nome": "Botão acende LED",
  "objetivo": "Acenda o LED vermelho enquanto o botão estiver apertado.",
  "conceito": "Agora juntamos a entrada e a saída no mesmo circuito: o botão (entrada) controla o LED (saída). A cada volta, o programa lê o botão e escreve no LED o valor correspondente. Este é o circuito mais clássico do Arduino, feito na micro:bit.",
  "resultado": "O LED acende enquanto o botão é mantido apertado e apaga quando ele é solto.",
  "desafio": "Coloque o segundo botão para apagar o LED, e faça o LED ficar aceso mesmo depois de soltar o primeiro.",
  "aviso": "Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado. O LED (com resistor de 220 Ω) fica em um pino que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\npins.setPull(DigitalPin.P8, PinPullMode.PullUp)\nbasic.forever(function () {\n    if (pins.digitalReadPin(DigitalPin.P8) == 0) {\n        pins.digitalWritePin(DigitalPin.P13, 1)\n    } else {\n        pins.digitalWritePin(DigitalPin.P13, 0)\n    }\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\npin8.set_pull(pin8.PULL_UP)\n\nwhile True:\n    if pin8.read_digital() == 0:\n        pin13.write_digital(1)\n    else:\n        pin13.write_digital(0)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_puxar_pino",
           "fields": {
            "P": "P8",
            "PULL": "UP"
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "EQ"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_ler_digital",
               "fields": {
                "P": "P8"
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_escrever_digital",
            "fields": {
             "P": "P13"
            },
            "inputs": {
             "V": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_escrever_digital",
            "fields": {
             "P": "P13"
            },
            "inputs": {
             "V": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 58,
  "modulo": 11,
  "n": 3,
  "nome": "Liga e desliga (alternar)",
  "objetivo": "Transforme o botão em um interruptor: aperta uma vez, o LED acende; aperta de novo, o LED apaga.",
  "conceito": "Um interruptor tem memória: guarda se o LED está ligado ou desligado. A variável ligado vale 0 ou 1. Cada aperto troca o valor: 1 − ligado (0 vira 1, 1 vira 0). Depois de trocar, o programa espera o botão ser solto: sem essa espera, um aperto só seria contado várias vezes.",
  "resultado": "Cada aperto do botão troca o estado do LED: aceso, apagado, aceso…",
  "desafio": "Faça a tela mostrar “ON” e “OFF” junto com o LED.",
  "aviso": "Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado. O LED (com resistor de 220 Ω) fica em um pino que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "let ligado = 0\nled.enable(false)\npins.setPull(DigitalPin.P8, PinPullMode.PullUp)\nligado = 0\nbasic.forever(function () {\n    if (pins.digitalReadPin(DigitalPin.P8) == 0) {\n        ligado = 1 - ligado\n        pins.digitalWritePin(DigitalPin.P13, ligado)\n        while (pins.digitalReadPin(DigitalPin.P8) == 0) {\n            basic.pause(10)\n        }\n    }\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\npin8.set_pull(pin8.PULL_UP)\nligado = 0\n\nwhile True:\n    if pin8.read_digital() == 0:\n        ligado = 1 - ligado\n        pin13.write_digital(ligado)\n        while pin8.read_digital() == 0:\n            sleep(10)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_puxar_pino",
           "fields": {
            "P": "P8",
            "PULL": "UP"
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_ligado"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "EQ"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_ler_digital",
               "fields": {
                "P": "P8"
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_var_definir",
            "fields": {
             "VAR": {
              "id": "v_ligado"
             }
            },
            "inputs": {
             "VALOR": {
              "block": {
               "type": "math_arithmetic",
               "fields": {
                "OP": "MINUS"
               },
               "inputs": {
                "A": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1
                  }
                 }
                },
                "B": {
                 "block": {
                  "type": "variables_get",
                  "fields": {
                   "VAR": {
                    "id": "v_ligado"
                   }
                  }
                 }
                }
               }
              }
             }
            },
            "next": {
             "block": {
              "type": "mb_escrever_digital",
              "fields": {
               "P": "P13"
              },
              "inputs": {
               "V": {
                "block": {
                 "type": "variables_get",
                 "fields": {
                  "VAR": {
                   "id": "v_ligado"
                  }
                 }
                }
               }
              },
              "next": {
               "block": {
                "type": "mb_enquanto",
                "inputs": {
                 "C": {
                  "block": {
                   "type": "logic_compare",
                   "fields": {
                    "OP": "EQ"
                   },
                   "inputs": {
                    "A": {
                     "block": {
                      "type": "mb_ler_digital",
                      "fields": {
                       "P": "P8"
                      }
                     }
                    },
                    "B": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 0
                      }
                     }
                    }
                   }
                  }
                 },
                 "DO": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 10
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "ligado",
     "id": "v_ligado"
    }
   ]
  }
 },
 {
  "numero": 59,
  "modulo": 11,
  "n": 4,
  "nome": "Dois botões",
  "objetivo": "Use dois botões e dois LEDs: o primeiro botão acende o LED vermelho e o segundo acende o verde.",
  "conceito": "Cada botão ocupa um pino e cada LED ocupa outro. O programa lê os dois botões, um depois do outro, e reage ao que estiver apertado. Ler dois sensores no mesmo laço é a base de controles de jogos.",
  "resultado": "O botão do primeiro pino acende o LED vermelho e o botão do segundo pino acende o LED verde, enquanto estiverem apertados.",
  "desafio": "Faça os dois LEDs acenderem juntos quando os dois botões forem apertados ao mesmo tempo.",
  "aviso": "Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado. O LED (com resistor de 220 Ω) fica em um pino que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\npins.setPull(DigitalPin.P8, PinPullMode.PullUp)\npins.setPull(DigitalPin.P9, PinPullMode.PullUp)\nbasic.forever(function () {\n    if (pins.digitalReadPin(DigitalPin.P8) == 0) {\n        pins.digitalWritePin(DigitalPin.P13, 1)\n    } else {\n        pins.digitalWritePin(DigitalPin.P13, 0)\n    }\n    if (pins.digitalReadPin(DigitalPin.P9) == 0) {\n        pins.digitalWritePin(DigitalPin.P15, 1)\n    } else {\n        pins.digitalWritePin(DigitalPin.P15, 0)\n    }\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\npin8.set_pull(pin8.PULL_UP)\npin9.set_pull(pin9.PULL_UP)\n\nwhile True:\n    if pin8.read_digital() == 0:\n        pin13.write_digital(1)\n    else:\n        pin13.write_digital(0)\n    if pin9.read_digital() == 0:\n        pin15.write_digital(1)\n    else:\n        pin15.write_digital(0)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_puxar_pino",
           "fields": {
            "P": "P8",
            "PULL": "UP"
           },
           "next": {
            "block": {
             "type": "mb_puxar_pino",
             "fields": {
              "P": "P9",
              "PULL": "UP"
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "controls_if",
         "inputs": {
          "IF0": {
           "block": {
            "type": "logic_compare",
            "fields": {
             "OP": "EQ"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "mb_ler_digital",
               "fields": {
                "P": "P8"
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          },
          "DO0": {
           "block": {
            "type": "mb_escrever_digital",
            "fields": {
             "P": "P13"
            },
            "inputs": {
             "V": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             }
            }
           }
          },
          "ELSE": {
           "block": {
            "type": "mb_escrever_digital",
            "fields": {
             "P": "P13"
            },
            "inputs": {
             "V": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             }
            }
           }
          }
         },
         "extraState": {
          "hasElse": true
         },
         "next": {
          "block": {
           "type": "controls_if",
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_compare",
              "fields": {
               "OP": "EQ"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "mb_ler_digital",
                 "fields": {
                  "P": "P9"
                 }
                }
               },
               "B": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 0
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_escrever_digital",
              "fields": {
               "P": "P15"
              },
              "inputs": {
               "V": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 1
                 }
                }
               }
              }
             }
            },
            "ELSE": {
             "block": {
              "type": "mb_escrever_digital",
              "fields": {
               "P": "P15"
              },
              "inputs": {
               "V": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 0
                 }
                }
               }
              }
             }
            }
           },
           "extraState": {
            "hasElse": true
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 60,
  "modulo": 11,
  "n": 5,
  "nome": "Desafio: jogo de reflexo",
  "objetivo": "Acenda o LED verde depois de uma espera surpresa e meça em quantos milissegundos você aperta o botão.",
  "conceito": "É o teste de reflexo, agora com componentes de verdade. O LED verde acende depois de uma espera sorteada; o programa anota a hora, espera o botão externo ser apertado e subtrai as horas. O laço “enquanto” faz a espera: ele repete até o botão ser apertado (pino em 0).",
  "resultado": "Aperte o botão A da placa para começar: o LED verde acende em um instante surpresa. Aperte o botão externo o mais rápido que puder e veja o seu tempo, em milissegundos, na tela.",
  "desafio": "Faça o LED vermelho piscar se você apertar o botão antes de o verde acender.",
  "aviso": "Ligue o botão entre o pino e o GND. O pino usa o resistor interno de “pull-up”: solto, o pino lê 1; apertado, lê 0. Por isso o programa procura o valor 0 para saber que o botão foi apertado. O LED (com resistor de 220 Ω) fica em um pino que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "let inicio = 0\nlet reacao = 0\nled.enable(false)\npins.setPull(DigitalPin.P8, PinPullMode.PullUp)\ninput.onButtonPressed(Button.A, function () {\n    pins.digitalWritePin(DigitalPin.P15, 0)\n    basic.pause(randint(2000, 5000))\n    pins.digitalWritePin(DigitalPin.P15, 1)\n    inicio = input.runningTime()\n    while (pins.digitalReadPin(DigitalPin.P8) == 1) {\n        basic.pause(1)\n    }\n    reacao = input.runningTime() - inicio\n    pins.digitalWritePin(DigitalPin.P15, 0)\n    led.enable(true)\n    basic.showNumber(reacao)\n    led.enable(false)\n})\n",
  "py": "from microbit import *\nimport random\n\ninicio = 0\nreacao = 0\ndisplay.off()\npin8.set_pull(pin8.PULL_UP)\n\nwhile True:\n    if button_a.was_pressed():\n        pin15.write_digital(0)\n        sleep(random.randint(2000, 5000))\n        pin15.write_digital(1)\n        inicio = running_time()\n        while pin8.read_digital() == 1:\n            sleep(1)\n        reacao = running_time() - inicio\n        pin15.write_digital(0)\n        display.on()\n        display.scroll(reacao)\n        display.off()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_puxar_pino",
           "fields": {
            "P": "P8",
            "PULL": "UP"
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_digital",
         "fields": {
          "P": "P15"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "mb_aleatorio",
              "inputs": {
               "DE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 2000
                 }
                }
               },
               "ATE": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 5000
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_digital",
             "fields": {
              "P": "P15"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_var_definir",
               "fields": {
                "VAR": {
                 "id": "v_inicio"
                }
               },
               "inputs": {
                "VALOR": {
                 "block": {
                  "type": "mb_tempo"
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_enquanto",
                 "inputs": {
                  "C": {
                   "block": {
                    "type": "logic_compare",
                    "fields": {
                     "OP": "EQ"
                    },
                    "inputs": {
                     "A": {
                      "block": {
                       "type": "mb_ler_digital",
                       "fields": {
                        "P": "P8"
                       }
                      }
                     },
                     "B": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  },
                  "DO": {
                   "block": {
                    "type": "mb_pausa",
                    "inputs": {
                     "MS": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_var_definir",
                   "fields": {
                    "VAR": {
                     "id": "v_reacao"
                    }
                   },
                   "inputs": {
                    "VALOR": {
                     "block": {
                      "type": "math_arithmetic",
                      "fields": {
                       "OP": "MINUS"
                      },
                      "inputs": {
                       "A": {
                        "block": {
                         "type": "mb_tempo"
                        }
                       },
                       "B": {
                        "block": {
                         "type": "variables_get",
                         "fields": {
                          "VAR": {
                           "id": "v_inicio"
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "mb_escrever_digital",
                     "fields": {
                      "P": "P15"
                     },
                     "inputs": {
                      "V": {
                       "block": {
                        "type": "math_number",
                        "fields": {
                         "NUM": 0
                        }
                       }
                      }
                     },
                     "next": {
                      "block": {
                       "type": "mb_tela_ligada",
                       "fields": {
                        "E": "TRUE"
                       },
                       "next": {
                        "block": {
                         "type": "mb_mostrar_numero",
                         "inputs": {
                          "N": {
                           "block": {
                            "type": "variables_get",
                            "fields": {
                             "VAR": {
                              "id": "v_reacao"
                             }
                            }
                           }
                          }
                         },
                         "next": {
                          "block": {
                           "type": "mb_tela_ligada",
                           "fields": {
                            "E": "FALSE"
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "inicio",
     "id": "v_inicio"
    },
    {
     "name": "reacao",
     "id": "v_reacao"
    }
   ]
  }
 },
 {
  "numero": 61,
  "modulo": 12,
  "n": 1,
  "nome": "Ler e mostrar",
  "objetivo": "Mostre na tela o número lido no potenciômetro.",
  "conceito": "O potenciômetro é um resistor que você gira. O pino do meio devolve uma tensão que varia com o giro. A micro:bit mede essa tensão com um conversor analógico e devolve um número de 0 (tudo para um lado) a 1023 (tudo para o outro).",
  "resultado": "Girando o botão, o número na tela vai de 0 até perto de 1023.",
  "desafio": "Gire até o meio: o valor é mais ou menos 512?",
  "aviso": "Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V.",
  "js": "basic.forever(function () {\n    basic.showNumber(pins.analogReadPin(AnalogPin.P2))\n    basic.pause(300)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    display.scroll(pin2.read_analog())\n    sleep(300)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_ler_analogico",
            "fields": {
             "P": "P2"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 300
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 62,
  "modulo": 12,
  "n": 2,
  "nome": "Potenciômetro no Traçador",
  "objetivo": "Envie o valor do potenciômetro para o Monitor e o Gráfico Serial.",
  "conceito": "Números que mudam rápido são mais fáceis de acompanhar no computador. No Gráfico Serial da IDE você verá uma linha que sobe e desce acompanhando o giro do botão: dá para ver o comportamento do sensor de um jeito que a tela pequena não mostra.",
  "resultado": "O Monitor Serial mostra “pot:” com o valor a cada 100 ms; o gráfico acompanha o giro.",
  "desafio": "Envie também o nível de luz para comparar os dois sensores no gráfico.",
  "aviso": "Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V.",
  "js": "basic.forever(function () {\n    serial.writeValue(\"pot\", pins.analogReadPin(AnalogPin.P2))\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\n\nwhile True:\n    print(\"pot:\", pin2.read_analog())\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_serial_valor",
         "inputs": {
          "NOME": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "pot"
            }
           }
          },
          "V": {
           "block": {
            "type": "mb_ler_analogico",
            "fields": {
             "P": "P2"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 100
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 63,
  "modulo": 12,
  "n": 3,
  "nome": "Potenciômetro controla o brilho",
  "objetivo": "Controle o brilho do LED amarelo girando o potenciômetro.",
  "conceito": "Aqui a entrada analógica alimenta uma saída analógica: o valor lido (0 a 1023) é escrito direto no pino do LED (que também aceita de 0 a 1023). É um dimmer, igual ao das lâmpadas reguláveis.",
  "resultado": "O LED fica mais brilhante quando o potenciômetro é girado para um lado e mais fraco para o outro.",
  "desafio": "Inverta o controle: o LED deve brilhar mais quando o botão for girado para o lado oposto.",
  "aviso": "Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V. Os LEDs (com resistor de 220 Ω) ficam em pinos que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "led.enable(false)\nbasic.forever(function () {\n    pins.analogWritePin(AnalogPin.P14, pins.analogReadPin(AnalogPin.P2))\n    basic.pause(20)\n})\n",
  "py": "from microbit import *\n\ndisplay.off()\n\nwhile True:\n    pin14.write_analog(pin2.read_analog())\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_analogico",
         "fields": {
          "P": "P14"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "mb_ler_analogico",
            "fields": {
             "P": "P2"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 20
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 64,
  "modulo": 12,
  "n": 4,
  "nome": "Potenciômetro no gráfico de barras",
  "objetivo": "Mostre a posição do potenciômetro como uma barra de LEDs na tela.",
  "conceito": "Com o gráfico de barras, a tela vira um medidor de volume: quanto mais você gira, mais LEDs acendem. O máximo 1023 é o maior valor que o potenciômetro entrega.",
  "resultado": "A barra de LEDs cresce e diminui acompanhando o giro do botão.",
  "desafio": "Coloque o máximo em 512 e veja a barra encher na metade do giro.",
  "aviso": "Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V.",
  "js": "basic.forever(function () {\n    led.plotBarGraph(pins.analogReadPin(AnalogPin.P2), 1023)\n    basic.pause(50)\n})\n",
  "py": "from microbit import *\n\ndef grafico_barras(valor, maximo):\n    proporcao = abs(valor) / maximo if maximo > 0 else 0\n    k = 0\n    for y in range(4, -1, -1):\n        for x in range(3):\n            brilho = 9 if k <= proporcao else 0\n            display.set_pixel(2 - x, y, brilho)\n            display.set_pixel(2 + x, y, brilho)\n            k += 1 / 16\n\nwhile True:\n    grafico_barras(pin2.read_analog(), 1023)\n    sleep(50)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_grafico_barras",
         "inputs": {
          "V": {
           "block": {
            "type": "mb_ler_analogico",
            "fields": {
             "P": "P2"
            }
           }
          },
          "MAX": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1023
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 50
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 65,
  "modulo": 12,
  "n": 5,
  "nome": "Desafio: seletor de LEDs",
  "objetivo": "Use o potenciômetro como seletor: cada terço do giro acende um LED diferente (vermelho, amarelo ou verde).",
  "conceito": "O potenciômetro entrega de 0 a 1023, mas temos só três LEDs. O bloco “mapear” converte 0–1023 em 0, 1 ou 2: cada terço do giro vira uma opção. Depois um “se … senão se … senão” apaga todos os LEDs e acende só o escolhido.",
  "resultado": "No começo do giro o LED vermelho fica aceso; no meio, o amarelo; no fim, o verde.",
  "desafio": "Acrescente um quarto estado: no fim do giro os três LEDs piscam.",
  "aviso": "Ligue o potenciômetro assim: um pino da ponta no 3V, o outro pino da ponta no GND e o pino do meio (cursor) no pino de leitura. Girar o botão faz o pino do meio variar de 0 V a 3,3 V. Os LEDs (com resistor de 220 Ω) ficam em pinos que a tela de LEDs também usa, por isso o programa desliga a tela primeiro.",
  "js": "let escolha = 0\nled.enable(false)\nescolha = 0\nbasic.forever(function () {\n    escolha = Math.constrain(pins.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, 0, 2), 0, 2)\n    pins.digitalWritePin(DigitalPin.P13, 0)\n    pins.digitalWritePin(DigitalPin.P14, 0)\n    pins.digitalWritePin(DigitalPin.P15, 0)\n    if (escolha == 0) {\n        pins.digitalWritePin(DigitalPin.P13, 1)\n    } else if (escolha == 1) {\n        pins.digitalWritePin(DigitalPin.P14, 1)\n    } else {\n        pins.digitalWritePin(DigitalPin.P15, 1)\n    }\n    basic.pause(50)\n})\n",
  "py": "from microbit import *\n\ndef mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)\n\ndisplay.off()\nescolha = 0\n\nwhile True:\n    escolha = max(0, min(2, mapear(pin2.read_analog(), 0, 1023, 0, 2)))\n    pin13.write_digital(0)\n    pin14.write_digital(0)\n    pin15.write_digital(0)\n    if escolha == 0:\n        pin13.write_digital(1)\n    elif escolha == 1:\n        pin14.write_digital(1)\n    else:\n        pin15.write_digital(1)\n    sleep(50)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tela_ligada",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_escolha"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_escolha"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_restringir",
            "inputs": {
             "V": {
              "block": {
               "type": "mb_mapear",
               "inputs": {
                "V": {
                 "block": {
                  "type": "mb_ler_analogico",
                  "fields": {
                   "P": "P2"
                  }
                 }
                },
                "A": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                },
                "B": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1023
                  }
                 }
                },
                "C": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                },
                "D": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 2
                  }
                 }
                }
               }
              }
             },
             "MIN": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "MAX": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 2
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_escrever_digital",
           "fields": {
            "P": "P13"
           },
           "inputs": {
            "V": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_digital",
             "fields": {
              "P": "P14"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_escrever_digital",
               "fields": {
                "P": "P15"
               },
               "inputs": {
                "V": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 0
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "controls_if",
                 "extraState": {
                  "elseIfCount": 1,
                  "hasElse": true
                 },
                 "inputs": {
                  "IF0": {
                   "block": {
                    "type": "logic_compare",
                    "fields": {
                     "OP": "EQ"
                    },
                    "inputs": {
                     "A": {
                      "block": {
                       "type": "variables_get",
                       "fields": {
                        "VAR": {
                         "id": "v_escolha"
                        }
                       }
                      }
                     },
                     "B": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 0
                       }
                      }
                     }
                    }
                   }
                  },
                  "DO0": {
                   "block": {
                    "type": "mb_escrever_digital",
                    "fields": {
                     "P": "P13"
                    },
                    "inputs": {
                     "V": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  },
                  "IF1": {
                   "block": {
                    "type": "logic_compare",
                    "fields": {
                     "OP": "EQ"
                    },
                    "inputs": {
                     "A": {
                      "block": {
                       "type": "variables_get",
                       "fields": {
                        "VAR": {
                         "id": "v_escolha"
                        }
                       }
                      }
                     },
                     "B": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  },
                  "DO1": {
                   "block": {
                    "type": "mb_escrever_digital",
                    "fields": {
                     "P": "P14"
                    },
                    "inputs": {
                     "V": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  },
                  "ELSE": {
                   "block": {
                    "type": "mb_escrever_digital",
                    "fields": {
                     "P": "P15"
                    },
                    "inputs": {
                     "V": {
                      "block": {
                       "type": "math_number",
                       "fields": {
                        "NUM": 1
                       }
                      }
                     }
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 50
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "escolha",
     "id": "v_escolha"
    }
   ]
  }
 },
 {
  "numero": 66,
  "modulo": 13,
  "n": 1,
  "nome": "Pulso e distância",
  "objetivo": "Mostre na tela a distância, em centímetros, até um obstáculo.",
  "conceito": "O sensor ultrassônico manda um estalo de som que a gente não ouve (o pulso no pino trig) e espera o eco voltar (o pino echo). Quanto mais longe o obstáculo, mais tempo o eco demora. A micro:bit mede esse tempo em microssegundos e divide por 58 para achar os centímetros. Se nenhum eco voltar, a medida sai -1.",
  "resultado": "A tela mostra a distância em cm até a sua mão ou a parede (de 2 a 400 cm).",
  "desafio": "Meça a distância até a parede e confira com uma régua.",
  "aviso": "O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar.",
  "js": "basic.forever(function () {\n    basic.showNumber(sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1))\n    basic.pause(500)\n})\n",
  "py": "from microbit import *\nimport sonar\n\nwhile True:\n    display.scroll(sonar.distancia_cm(pin16, pin1))\n    sleep(500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_mostrar_numero",
         "inputs": {
          "N": {
           "block": {
            "type": "mb_distancia_cm",
            "fields": {
             "TRIG": "P16",
             "ECO": "P1"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 67,
  "modulo": 13,
  "n": 2,
  "nome": "Monitor em cm",
  "objetivo": "Envie a distância para o Monitor Serial.",
  "conceito": "Sensores de distância variam um pouco a cada leitura. No Gráfico Serial, você vê a linha subir e descer com o movimento da sua mão e percebe pequenas oscilações que a tela pequena esconde.",
  "resultado": "O Monitor Serial mostra “dist:” com o valor em cm a cada 200 ms.",
  "desafio": "Balance a mão à frente do sensor e olhe o gráfico.",
  "aviso": "O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar.",
  "js": "basic.forever(function () {\n    serial.writeValue(\"dist\", sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1))\n    basic.pause(200)\n})\n",
  "py": "from microbit import *\nimport sonar\n\nwhile True:\n    print(\"dist:\", sonar.distancia_cm(pin16, pin1))\n    sleep(200)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_serial_valor",
         "inputs": {
          "NOME": {
           "block": {
            "type": "text",
            "fields": {
             "TEXT": "dist"
            }
           }
          },
          "V": {
           "block": {
            "type": "mb_distancia_cm",
            "fields": {
             "TRIG": "P16",
             "ECO": "P1"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 200
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 68,
  "modulo": 13,
  "n": 3,
  "nome": "Alerta de proximidade",
  "objetivo": "Mostre um rosto bravo quando alguém chegar a menos de 10 cm.",
  "conceito": "Guardamos a medida em uma variável para usar duas vezes sem medir de novo. A condição usa “e”: a distância precisa ser maior que 0 (houve eco) E menor que 10 (está perto). Sem a primeira parte, o -1 de “sem eco” faria o alarme disparar à toa.",
  "resultado": "Perto (menos de 10 cm) aparece um rosto bravo; longe, um rosto feliz.",
  "desafio": "Troque o rosto por um apito: toque uma nota quando o objeto estiver perto demais.",
  "aviso": "O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar.",
  "js": "let distancia = 0\ndistancia = 0\nbasic.forever(function () {\n    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)\n    if (distancia > 0 && distancia < 10) {\n        basic.showIcon(IconNames.Angry)\n    } else {\n        basic.showIcon(IconNames.Happy)\n    }\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\nimport sonar\n\ndistancia = 0\n\nwhile True:\n    distancia = sonar.distancia_cm(pin16, pin1)\n    if distancia > 0 and distancia < 10:\n        display.show(Image.ANGRY)\n    else:\n        display.show(Image.HAPPY)\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_distancia"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_distancia"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_distancia_cm",
            "fields": {
             "TRIG": "P16",
             "ECO": "P1"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "controls_if",
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_operation",
              "fields": {
               "OP": "AND"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "logic_compare",
                 "fields": {
                  "OP": "GT"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "variables_get",
                    "fields": {
                     "VAR": {
                      "id": "v_distancia"
                     }
                    }
                   }
                  },
                  "B": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 0
                    }
                   }
                  }
                 }
                }
               },
               "B": {
                "block": {
                 "type": "logic_compare",
                 "fields": {
                  "OP": "LT"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "variables_get",
                    "fields": {
                     "VAR": {
                      "id": "v_distancia"
                     }
                    }
                   }
                  },
                  "B": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 10
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_mostrar_icone",
              "fields": {
               "ICONE": "Angry"
              }
             }
            },
            "ELSE": {
             "block": {
              "type": "mb_mostrar_icone",
              "fields": {
               "ICONE": "Happy"
              }
             }
            }
           },
           "extraState": {
            "hasElse": true
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 100
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "distancia",
     "id": "v_distancia"
    }
   ]
  }
 },
 {
  "numero": 69,
  "modulo": 13,
  "n": 4,
  "nome": "Distância em barras",
  "objetivo": "Mostre a distância como uma barra: quanto mais longe, mais LEDs acesos.",
  "conceito": "Para o radar, mostramos a distância como barra em uma escala de 0 a 50 cm. Objetos além de 50 cm enchem a barra por completo. É uma forma rápida de “ver” a distância sem ler número.",
  "resultado": "Quando você aproxima a mão, a barra de LEDs diminui; afastando, ela cresce.",
  "desafio": "Inverta a barra: mais perto deve encher mais LEDs.",
  "aviso": "O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar.",
  "js": "basic.forever(function () {\n    led.plotBarGraph(sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1), 50)\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\nimport sonar\n\ndef grafico_barras(valor, maximo):\n    proporcao = abs(valor) / maximo if maximo > 0 else 0\n    k = 0\n    for y in range(4, -1, -1):\n        for x in range(3):\n            brilho = 9 if k <= proporcao else 0\n            display.set_pixel(2 - x, y, brilho)\n            display.set_pixel(2 + x, y, brilho)\n            k += 1 / 16\n\nwhile True:\n    grafico_barras(sonar.distancia_cm(pin16, pin1), 50)\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_grafico_barras",
         "inputs": {
          "V": {
           "block": {
            "type": "mb_distancia_cm",
            "fields": {
             "TRIG": "P16",
             "ECO": "P1"
            }
           }
          },
          "MAX": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 50
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 100
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 70,
  "modulo": 13,
  "n": 5,
  "nome": "Desafio: sensor de ré com buzzer",
  "objetivo": "Faça o buzzer apitar mais rápido quanto mais perto um obstáculo estiver, como o sensor de ré do carro.",
  "conceito": "A pausa entre os apitos é proporcional à distância: 10 vezes o valor em cm. A 30 cm, a pausa é de 300 ms; a 5 cm, de só 50 ms, e os apitos ficam quase contínuos. Só apita se a distância estiver entre 1 e 30 cm. O buzzer fica no pino P0 e o alto-falante da placa é desligado.",
  "resultado": "Aproximando um objeto, os apitos do buzzer ficam cada vez mais rápidos.",
  "desafio": "Mostre também a distância na tela enquanto apita.",
  "aviso": "O HC-SR04 usa 5 V (ligue o VCC na saída de 5 V do adaptador, ou de uma fonte externa com o GND em comum). ATENÇÃO: o pino ECHO devolve 5 V, mas a micro:bit aguenta no máximo 3,3 V. Ligue um divisor de tensão no ECHO (por exemplo, 1 kΩ e 2 kΩ) ou use um módulo HC-SR04 versão 3,3 V, senão o pino pode queimar. O buzzer passivo fica entre o pino P0 (fio do +) e o GND.",
  "js": "let distancia = 0\nmusic.setBuiltInSpeakerEnabled(false)\ndistancia = 0\nbasic.forever(function () {\n    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)\n    if (distancia > 0 && distancia < 30) {\n        music.playTone(880, music.beat(BeatFraction.Sixteenth))\n        basic.pause(distancia * 10)\n    }\n    basic.pause(50)\n})\n",
  "py": "from microbit import *\nimport music\nimport sonar\n\nspeaker.off()\ndistancia = 0\n\nwhile True:\n    distancia = sonar.distancia_cm(pin16, pin1)\n    if distancia > 0 and distancia < 30:\n        music.pitch(880, 125)\n        sleep(distancia * 10)\n    sleep(50)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_distancia"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_distancia"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_distancia_cm",
            "fields": {
             "TRIG": "P16",
             "ECO": "P1"
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "controls_if",
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_operation",
              "fields": {
               "OP": "AND"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "logic_compare",
                 "fields": {
                  "OP": "GT"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "variables_get",
                    "fields": {
                     "VAR": {
                      "id": "v_distancia"
                     }
                    }
                   }
                  },
                  "B": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 0
                    }
                   }
                  }
                 }
                }
               },
               "B": {
                "block": {
                 "type": "logic_compare",
                 "fields": {
                  "OP": "LT"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "variables_get",
                    "fields": {
                     "VAR": {
                      "id": "v_distancia"
                     }
                    }
                   }
                  },
                  "B": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 30
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_tocar_tom",
              "fields": {
               "B": "Sixteenth"
              },
              "inputs": {
               "F": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 880
                 }
                }
               }
              },
              "next": {
               "block": {
                "type": "mb_pausa",
                "inputs": {
                 "MS": {
                  "block": {
                   "type": "math_arithmetic",
                   "fields": {
                    "OP": "MULTIPLY"
                   },
                   "inputs": {
                    "A": {
                     "block": {
                      "type": "variables_get",
                      "fields": {
                       "VAR": {
                        "id": "v_distancia"
                       }
                      }
                     }
                    },
                    "B": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 10
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 50
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "distancia",
     "id": "v_distancia"
    }
   ]
  }
 },
 {
  "numero": 71,
  "modulo": 14,
  "n": 1,
  "nome": "Tom no P0",
  "objetivo": "Faça o buzzer dar um bip de meio segundo quando a micro:bit ligar.",
  "conceito": "Um buzzer passivo é um alto-falante pequeno: quando o pino manda um sinal que liga e desliga rápido (uma frequência), ele vibra e faz som. Quanto maior a frequência, mais agudo o som. O tom de 440 Hz é a nota lá, usada para afinar instrumentos. A música da micro:bit sai pelo pino P0, onde o buzzer está ligado.",
  "resultado": "Um bip de 440 Hz (nota lá) toca por meio segundo no buzzer.",
  "desafio": "Faça um bip mais agudo (880 Hz) e outro mais grave (220 Hz).",
  "aviso": "Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes.",
  "js": "music.setBuiltInSpeakerEnabled(false)\nmusic.playTone(440, music.beat(BeatFraction.Half))\n",
  "py": "from microbit import *\nimport music\n\nspeaker.off()\nmusic.pitch(440, 1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_tocar_tom",
           "fields": {
            "B": "Half"
           },
           "inputs": {
            "F": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 440
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 72,
  "modulo": 14,
  "n": 2,
  "nome": "Notas",
  "objetivo": "Toque a escala completa: dó, ré, mi, fá, sol, lá, si e dó agudo.",
  "conceito": "Uma escala é uma sequência de notas de grave para agudo. As oito notas formam uma oitava. Cada nota vira uma linha do programa: o código só repete o padrão “tocar nota, por uma batida”.",
  "resultado": "O buzzer toca as oito notas da escala, uma depois da outra.",
  "desafio": "Toque a escala de trás para frente, do dó agudo até o dó grave.",
  "aviso": "Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes.",
  "js": "music.setBuiltInSpeakerEnabled(false)\nmusic.playTone(Note.C, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.D, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.E, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.F, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.G, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.A, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.B, music.beat(BeatFraction.Quarter))\nmusic.playTone(Note.C5, music.beat(BeatFraction.Quarter))\n",
  "py": "from microbit import *\nimport music\n\nspeaker.off()\nmusic.pitch(262, 500)\nmusic.pitch(294, 500)\nmusic.pitch(330, 500)\nmusic.pitch(349, 500)\nmusic.pitch(392, 500)\nmusic.pitch(440, 500)\nmusic.pitch(494, 500)\nmusic.pitch(523, 500)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_tocar_nota",
           "fields": {
            "NOTA": "C",
            "B": "Quarter"
           },
           "next": {
            "block": {
             "type": "mb_tocar_nota",
             "fields": {
              "NOTA": "D",
              "B": "Quarter"
             },
             "next": {
              "block": {
               "type": "mb_tocar_nota",
               "fields": {
                "NOTA": "E",
                "B": "Quarter"
               },
               "next": {
                "block": {
                 "type": "mb_tocar_nota",
                 "fields": {
                  "NOTA": "F",
                  "B": "Quarter"
                 },
                 "next": {
                  "block": {
                   "type": "mb_tocar_nota",
                   "fields": {
                    "NOTA": "G",
                    "B": "Quarter"
                   },
                   "next": {
                    "block": {
                     "type": "mb_tocar_nota",
                     "fields": {
                      "NOTA": "A",
                      "B": "Quarter"
                     },
                     "next": {
                      "block": {
                       "type": "mb_tocar_nota",
                       "fields": {
                        "NOTA": "B",
                        "B": "Quarter"
                       },
                       "next": {
                        "block": {
                         "type": "mb_tocar_nota",
                         "fields": {
                          "NOTA": "C5",
                          "B": "Quarter"
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 73,
  "modulo": 14,
  "n": 3,
  "nome": "Melodia",
  "objetivo": "Toque a melodia “Parabéns pra você” no buzzer.",
  "conceito": "Melodias prontas tocam pelo mesmo caminho das notas: direto no buzzer conectado ao P0 (com o alto-falante da placa desligado). É uma boa forma de testar o circuito antes de montar suas próprias músicas nota por nota.",
  "resultado": "A melodia Parabéns toca uma vez no buzzer quando a placa liga.",
  "desafio": "Troque a melodia por outra e faça-a tocar só quando o botão A for apertado.",
  "aviso": "Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes.",
  "js": "music.setBuiltInSpeakerEnabled(false)\nmusic.play(music.builtInPlayableMelody(Melodies.Birthday), music.PlaybackMode.UntilDone)\n",
  "py": "from microbit import *\nimport music\n\nspeaker.off()\nmusic.play(music.BIRTHDAY)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_tocar_melodia",
           "fields": {
            "M": "Birthday"
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 74,
  "modulo": 14,
  "n": 4,
  "nome": "Botão toca nota",
  "objetivo": "Use os botões como teclas: A toca dó, B toca mi e A+B toca sol.",
  "conceito": "Cada tecla é um evento que toca uma nota no buzzer. O toque do logotipo funciona como pedal: corta o som na hora. Em um instrumento de verdade, você teria mais teclas: aqui bastam três para tocar acordes simples.",
  "resultado": "A toca dó, B toca mi, A+B toca sol. O toque no logotipo para o som.",
  "desafio": "Ligue um segundo buzzer e toque duas notas ao mesmo tempo.",
  "aviso": "Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes.",
  "js": "music.setBuiltInSpeakerEnabled(false)\ninput.onButtonPressed(Button.A, function () {\n    music.playTone(Note.C, music.beat(BeatFraction.Quarter))\n})\ninput.onButtonPressed(Button.B, function () {\n    music.playTone(Note.E, music.beat(BeatFraction.Quarter))\n})\ninput.onButtonPressed(Button.AB, function () {\n    music.playTone(Note.G, music.beat(BeatFraction.Quarter))\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    music.stopAllSounds()\n})\n",
  "py": "from microbit import *\nimport music\n\nspeaker.off()\n\nwhile True:\n    if button_a.was_pressed():\n        music.pitch(262, 500)\n    if button_b.was_pressed():\n        music.pitch(330, 500)\n    if (button_a.is_pressed() and button_b.is_pressed()):\n        music.pitch(392, 500)\n    if pin_logo.is_touched():\n        audio.stop()\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "C",
          "B": "Quarter"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "E",
          "B": "Quarter"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 680,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "AB"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_tocar_nota",
         "fields": {
          "NOTA": "G",
          "B": "Quarter"
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 900,
      "type": "mb_ao_logo",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_parar_sons"
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 75,
  "modulo": 14,
  "n": 5,
  "nome": "Desafio: alarme com pot e ultrassônico",
  "objetivo": "Faça um alarme que apita quando algo chega perto do sensor, com a distância de disparo regulada pelo potenciômetro.",
  "conceito": "Juntamos três componentes: o ultrassônico mede a distância, o potenciômetro escolhe o limite (de 5 a 50 cm, com “mapear”) e o buzzer apita quando um objeto passa desse limite. Girar o potenciômetro deixa o alarme mais ou menos sensível, sem mudar o programa.",
  "resultado": "Quando um objeto chega mais perto do que o limite escolhido no potenciômetro, o buzzer apita.",
  "desafio": "Mostre o limite escolhido na tela quando o botão A for apertado.",
  "aviso": "Ligue o buzzer entre o pino P0 (fio do +) e o GND. O programa desliga o alto-falante da placa para o som sair só pelo buzzer. Buzzer “ativo” (com circuito de som dentro) faz sempre o mesmo som; use um buzzer “passivo” para tocar notas diferentes. O ultrassônico usa 5 V e o pino ECHO precisa de divisor de tensão (veja o módulo do ultrassônico). O potenciômetro fica no pino P2.",
  "js": "let limite = 0\nlet distancia = 0\nmusic.setBuiltInSpeakerEnabled(false)\nlimite = 20\ndistancia = 0\nbasic.forever(function () {\n    limite = pins.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, 5, 50)\n    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)\n    if (distancia > 0 && distancia < limite) {\n        music.playTone(880, music.beat(BeatFraction.Eighth))\n    }\n    basic.pause(100)\n})\n",
  "py": "from microbit import *\nimport music\nimport sonar\n\ndef mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)\n\nspeaker.off()\nlimite = 20\ndistancia = 0\n\nwhile True:\n    limite = mapear(pin2.read_analog(), 0, 1023, 5, 50)\n    distancia = sonar.distancia_cm(pin16, pin1)\n    if distancia > 0 and distancia < limite:\n        music.pitch(880, 250)\n    sleep(100)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_alto_falante",
         "fields": {
          "E": "FALSE"
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_limite"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 20
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_var_definir",
             "fields": {
              "VAR": {
               "id": "v_distancia"
              }
             },
             "inputs": {
              "VALOR": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_limite"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_mapear",
            "inputs": {
             "V": {
              "block": {
               "type": "mb_ler_analogico",
               "fields": {
                "P": "P2"
               }
              }
             },
             "A": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1023
               }
              }
             },
             "C": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 5
               }
              }
             },
             "D": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 50
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_distancia"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "mb_distancia_cm",
              "fields": {
               "TRIG": "P16",
               "ECO": "P1"
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "controls_if",
             "inputs": {
              "IF0": {
               "block": {
                "type": "logic_operation",
                "fields": {
                 "OP": "AND"
                },
                "inputs": {
                 "A": {
                  "block": {
                   "type": "logic_compare",
                   "fields": {
                    "OP": "GT"
                   },
                   "inputs": {
                    "A": {
                     "block": {
                      "type": "variables_get",
                      "fields": {
                       "VAR": {
                        "id": "v_distancia"
                       }
                      }
                     }
                    },
                    "B": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 0
                      }
                     }
                    }
                   }
                  }
                 },
                 "B": {
                  "block": {
                   "type": "logic_compare",
                   "fields": {
                    "OP": "LT"
                   },
                   "inputs": {
                    "A": {
                     "block": {
                      "type": "variables_get",
                      "fields": {
                       "VAR": {
                        "id": "v_distancia"
                       }
                      }
                     }
                    },
                    "B": {
                     "block": {
                      "type": "variables_get",
                      "fields": {
                       "VAR": {
                        "id": "v_limite"
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              },
              "DO0": {
               "block": {
                "type": "mb_tocar_tom",
                "fields": {
                 "B": "Eighth"
                },
                "inputs": {
                 "F": {
                  "block": {
                   "type": "math_number",
                   "fields": {
                    "NUM": 880
                   }
                  }
                 }
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 100
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "distancia",
     "id": "v_distancia"
    },
    {
     "name": "limite",
     "id": "v_limite"
    }
   ]
  }
 },
 {
  "numero": 76,
  "modulo": 15,
  "n": 1,
  "nome": "Ângulo fixo",
  "objetivo": "Coloque o servo motor na posição 90°, no meio do curso.",
  "conceito": "Um servo motor gira até um ângulo que você pede, de 0° a 180°, e fica parado lá. Para isso ele recebe pulsos repetidos; o comprimento de cada pulso diz o ângulo. A micro:bit cuida dos pulsos: você só informa o ângulo.",
  "resultado": "O braço do servo vai para o meio (90°) e fica parado.",
  "desafio": "Coloque uma tira de papel no braço do servo para enxergar melhor o ângulo.",
  "aviso": "O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes.",
  "js": "pins.servoWritePin(AnalogPin.P1, 90)\n",
  "py": "from microbit import *\n\npin1.set_analog_period(20)\npin1.write_analog(int(26 + (90) * 102 / 180))\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 90
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 77,
  "modulo": 15,
  "n": 2,
  "nome": "Varredura de 0° a 180°",
  "objetivo": "Faça o servo ir para 0°, depois 90°, depois 180°, e repetir.",
  "conceito": "O servo precisa de tempo para chegar ao ângulo pedido. A pausa entre os comandos dá esse tempo. Sem pausa, o programa manda o próximo ângulo antes de o servo chegar, e ele parece tremer sem sair do lugar.",
  "resultado": "O servo passa por 0°, 90° e 180°, esperando 1 segundo em cada.",
  "desafio": "Inclua os ângulos 45° e 135° para a varredura ser mais suave.",
  "aviso": "O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes.",
  "js": "basic.forever(function () {\n    pins.servoWritePin(AnalogPin.P1, 0)\n    basic.pause(1000)\n    pins.servoWritePin(AnalogPin.P1, 90)\n    basic.pause(1000)\n    pins.servoWritePin(AnalogPin.P1, 180)\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\n\npin1.set_analog_period(20)\n\nwhile True:\n    pin1.write_analog(int(26 + (0) * 102 / 180))\n    sleep(1000)\n    pin1.write_analog(int(26 + (90) * 102 / 180))\n    sleep(1000)\n    pin1.write_analog(int(26 + (180) * 102 / 180))\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 1000
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_servo",
             "fields": {
              "P": "P1"
             },
             "inputs": {
              "A": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 90
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_servo",
                 "fields": {
                  "P": "P1"
                 },
                 "inputs": {
                  "A": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 180
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 1000
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 78,
  "modulo": 15,
  "n": 3,
  "nome": "Potenciômetro controla o servo",
  "objetivo": "Controle o ângulo do servo girando o potenciômetro.",
  "conceito": "O potenciômetro entrega de 0 a 1023, mas o servo espera de 0 a 180. O bloco “mapear” converte uma escala na outra. O braço do servo copia o giro do botão, como um leme: gire para um lado e o servo acompanha.",
  "resultado": "O braço do servo acompanha o giro do potenciômetro.",
  "desafio": "Faça o servo acompanhar o giro ao contrário.",
  "aviso": "O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes. O potenciômetro fica no pino P2.",
  "js": "basic.forever(function () {\n    pins.servoWritePin(AnalogPin.P1, pins.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, 0, 180))\n    basic.pause(20)\n})\n",
  "py": "from microbit import *\n\ndef mapear(valor, de_min, de_max, para_min, para_max):\n    return int((valor - de_min) * (para_max - para_min) / (de_max - de_min) + para_min)\n\npin1.set_analog_period(20)\n\nwhile True:\n    pin1.write_analog(int(26 + (mapear(pin2.read_analog(), 0, 1023, 0, 180)) * 102 / 180))\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "mb_mapear",
            "inputs": {
             "V": {
              "block": {
               "type": "mb_ler_analogico",
               "fields": {
                "P": "P2"
               }
              }
             },
             "A": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "B": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1023
               }
              }
             },
             "C": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 0
               }
              }
             },
             "D": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 180
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 20
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 79,
  "modulo": 15,
  "n": 4,
  "nome": "Botões A e B giram",
  "objetivo": "Mova o servo com os botões: A leva para 0°, B leva para 180° e A+B volta para o meio.",
  "conceito": "Cada botão dispara um evento que manda um ângulo diferente. É como um controle remoto: o servo só faz o que o comando manda. Esse desenho é usado em braços robóticos e portões automáticos.",
  "resultado": "O botão A leva o servo para 0°, o B para 180° e o A+B para 90°.",
  "desafio": "Faça cada aperto do A avançar o servo 20° em vez de ir de uma vez até a ponta.",
  "aviso": "O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes.",
  "js": "input.onButtonPressed(Button.A, function () {\n    pins.servoWritePin(AnalogPin.P1, 0)\n})\ninput.onButtonPressed(Button.B, function () {\n    pins.servoWritePin(AnalogPin.P1, 180)\n})\ninput.onButtonPressed(Button.AB, function () {\n    pins.servoWritePin(AnalogPin.P1, 90)\n})\n",
  "py": "from microbit import *\n\npin1.set_analog_period(20)\n\nwhile True:\n    if button_a.was_pressed():\n        pin1.write_analog(int(26 + (0) * 102 / 180))\n    if button_b.was_pressed():\n        pin1.write_analog(int(26 + (180) * 102 / 180))\n    if (button_a.is_pressed() and button_b.is_pressed()):\n        pin1.write_analog(int(26 + (90) * 102 / 180))\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 180
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "AB"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 90
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 80,
  "modulo": 15,
  "n": 5,
  "nome": "Desafio: cancela automática",
  "objetivo": "Faça uma cancela: ao apertar A (o carro chegou) ela sobe devagar, espera 3 segundos e desce devagar.",
  "conceito": "Uma cancela é uma sequência automática: abrir, esperar e fechar. Para o movimento ser suave, contamos de 0 a 90 com um laço “para”, movendo o servo 1° por vez. Depois de 3 segundos com a cancela aberta, contamos ao contrário (90 − i) para fechar. O botão A faz o papel do sensor que avisa que o carro chegou.",
  "resultado": "Ao apertar A, o servo sobe devagar de 0° a 90°, espera 3 segundos e volta a 0°, mostrando um coração enquanto está aberto.",
  "desafio": "Coloque LEDs vermelho e verde: verde com a cancela aberta e vermelho com ela fechada.",
  "aviso": "O servo tem três fios: marrom/preto (GND), vermelho (+) e laranja/amarelo (sinal). Servos puxam bastante corrente: alimente o fio vermelho com uma fonte externa (por exemplo 4 pilhas AA = 6 V, ou o adaptador), com o GND ligado também ao da micro:bit. Ligar o servo direto no 3V pode reiniciar a placa. O pino do servo é o mesmo do ECHO do ultrassônico: desligue o ultrassônico antes.",
  "js": "let i = 0\npins.servoWritePin(AnalogPin.P1, 0)\ninput.onButtonPressed(Button.A, function () {\n    for (let i = 0; i <= 90; i++) {\n        pins.servoWritePin(AnalogPin.P1, i)\n        basic.pause(10)\n    }\n    basic.showIcon(IconNames.Heart)\n    basic.pause(3000)\n    basic.clearScreen()\n    for (let i = 0; i <= 90; i++) {\n        pins.servoWritePin(AnalogPin.P1, 90 - i)\n        basic.pause(10)\n    }\n})\n",
  "py": "from microbit import *\n\ni = 0\npin1.set_analog_period(20)\npin1.write_analog(int(26 + (0) * 102 / 180))\n\nwhile True:\n    if button_a.was_pressed():\n        for i in range(91):\n            pin1.write_analog(int(26 + (i) * 102 / 180))\n            sleep(10)\n        display.show(Image.HEART)\n        sleep(3000)\n        display.clear()\n        for i in range(91):\n            pin1.write_analog(int(26 + (90 - i) * 102 / 180))\n            sleep(10)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_servo",
         "fields": {
          "P": "P1"
         },
         "inputs": {
          "A": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_para",
         "fields": {
          "VAR": {
           "id": "v_i"
          }
         },
         "inputs": {
          "ATE": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 90
            }
           }
          },
          "DO": {
           "block": {
            "type": "mb_servo",
            "fields": {
             "P": "P1"
            },
            "inputs": {
             "A": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_i"
                }
               }
              }
             }
            },
            "next": {
             "block": {
              "type": "mb_pausa",
              "inputs": {
               "MS": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 10
                 }
                }
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_mostrar_icone",
           "fields": {
            "ICONE": "Heart"
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 3000
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_limpar_tela",
               "next": {
                "block": {
                 "type": "mb_para",
                 "fields": {
                  "VAR": {
                   "id": "v_i"
                  }
                 },
                 "inputs": {
                  "ATE": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 90
                    }
                   }
                  },
                  "DO": {
                   "block": {
                    "type": "mb_servo",
                    "fields": {
                     "P": "P1"
                    },
                    "inputs": {
                     "A": {
                      "block": {
                       "type": "math_arithmetic",
                       "fields": {
                        "OP": "MINUS"
                       },
                       "inputs": {
                        "A": {
                         "block": {
                          "type": "math_number",
                          "fields": {
                           "NUM": 90
                          }
                         }
                        },
                        "B": {
                         "block": {
                          "type": "variables_get",
                          "fields": {
                           "VAR": {
                            "id": "v_i"
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    },
                    "next": {
                     "block": {
                      "type": "mb_pausa",
                      "inputs": {
                       "MS": {
                        "block": {
                         "type": "math_number",
                         "fields": {
                          "NUM": 10
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "i",
     "id": "v_i"
    }
   ]
  }
 },
 {
  "numero": 81,
  "modulo": 16,
  "n": 1,
  "nome": "Segmento a segmento",
  "objetivo": "Acenda os segmentos do display um de cada vez, de a até g.",
  "conceito": "O display de 7 segmentos é feito de 7 LEDs em forma de traço (a até g), mais o pontinho. Cada segmento é ligado a um pino da micro:bit: escrever 1 no pino acende o traço. Acendendo alguns traços, formam-se os algarismos. Aqui testamos cada segmento sozinho, para conferir a ligação.",
  "resultado": "Os segmentos acendem um por um, de a até g, a cada meio segundo, e depois apagam.",
  "desafio": "Acenda os segmentos b e c juntos: qual algarismo aparece?",
  "aviso": "Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).",
  "js": "led.enable(false)\npins.digitalWritePin(DigitalPin.P3, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P4, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P6, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P7, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P10, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P13, 1)\nbasic.pause(500)\npins.digitalWritePin(DigitalPin.P14, 1)\nbasic.pause(500)\nsete_seg.apagar()\n",
  "py": "from microbit import *\nimport sete_seg\n\ndisplay.off()\npin3.write_digital(1)\nsleep(500)\npin4.write_digital(1)\nsleep(500)\npin6.write_digital(1)\nsleep(500)\npin7.write_digital(1)\nsleep(500)\npin10.write_digital(1)\nsleep(500)\npin13.write_digital(1)\nsleep(500)\npin14.write_digital(1)\nsleep(500)\nsete_seg.apagar()\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_escrever_digital",
         "fields": {
          "P": "P3"
         },
         "inputs": {
          "V": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_pausa",
           "inputs": {
            "MS": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 500
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_escrever_digital",
             "fields": {
              "P": "P4"
             },
             "inputs": {
              "V": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 500
                  }
                 }
                }
               },
               "next": {
                "block": {
                 "type": "mb_escrever_digital",
                 "fields": {
                  "P": "P6"
                 },
                 "inputs": {
                  "V": {
                   "block": {
                    "type": "math_number",
                    "fields": {
                     "NUM": 1
                    }
                   }
                  }
                 },
                 "next": {
                  "block": {
                   "type": "mb_pausa",
                   "inputs": {
                    "MS": {
                     "block": {
                      "type": "math_number",
                      "fields": {
                       "NUM": 500
                      }
                     }
                    }
                   },
                   "next": {
                    "block": {
                     "type": "mb_escrever_digital",
                     "fields": {
                      "P": "P7"
                     },
                     "inputs": {
                      "V": {
                       "block": {
                        "type": "math_number",
                        "fields": {
                         "NUM": 1
                        }
                       }
                      }
                     },
                     "next": {
                      "block": {
                       "type": "mb_pausa",
                       "inputs": {
                        "MS": {
                         "block": {
                          "type": "math_number",
                          "fields": {
                           "NUM": 500
                          }
                         }
                        }
                       },
                       "next": {
                        "block": {
                         "type": "mb_escrever_digital",
                         "fields": {
                          "P": "P10"
                         },
                         "inputs": {
                          "V": {
                           "block": {
                            "type": "math_number",
                            "fields": {
                             "NUM": 1
                            }
                           }
                          }
                         },
                         "next": {
                          "block": {
                           "type": "mb_pausa",
                           "inputs": {
                            "MS": {
                             "block": {
                              "type": "math_number",
                              "fields": {
                               "NUM": 500
                              }
                             }
                            }
                           },
                           "next": {
                            "block": {
                             "type": "mb_escrever_digital",
                             "fields": {
                              "P": "P13"
                             },
                             "inputs": {
                              "V": {
                               "block": {
                                "type": "math_number",
                                "fields": {
                                 "NUM": 1
                                }
                               }
                              }
                             },
                             "next": {
                              "block": {
                               "type": "mb_pausa",
                               "inputs": {
                                "MS": {
                                 "block": {
                                  "type": "math_number",
                                  "fields": {
                                   "NUM": 500
                                  }
                                 }
                                }
                               },
                               "next": {
                                "block": {
                                 "type": "mb_escrever_digital",
                                 "fields": {
                                  "P": "P14"
                                 },
                                 "inputs": {
                                  "V": {
                                   "block": {
                                    "type": "math_number",
                                    "fields": {
                                     "NUM": 1
                                    }
                                   }
                                  }
                                 },
                                 "next": {
                                  "block": {
                                   "type": "mb_pausa",
                                   "inputs": {
                                    "MS": {
                                     "block": {
                                      "type": "math_number",
                                      "fields": {
                                       "NUM": 500
                                      }
                                     }
                                    }
                                   },
                                   "next": {
                                    "block": {
                                     "type": "mb_7seg_apagar"
                                    }
                                   }
                                  }
                                 }
                                }
                               }
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 82,
  "modulo": 16,
  "n": 2,
  "nome": "Número 0",
  "objetivo": "Mostre o número 0 no display de 7 segmentos.",
  "conceito": "Fazer cada algarismo à mão é trabalhoso: são 7 linhas para cada número! Por isso existe o bloco “mostrar dígito”: ele já sabe quais traços acender para cada número de 0 a 9. Basta informar o número. O “0” acende seis segmentos (todos, menos o g).",
  "resultado": "O display mostra o número 0.",
  "desafio": "Mostre o seu número da sorte, de 0 a 9.",
  "aviso": "Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).",
  "js": "led.enable(false)\nsete_seg.mostrar(0)\n",
  "py": "from microbit import *\nimport sete_seg\n\ndisplay.off()\nsete_seg.mostrar(0)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_7seg_mostrar",
         "inputs": {
          "N": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 83,
  "modulo": 16,
  "n": 3,
  "nome": "De 0 a 9",
  "objetivo": "Faça o display contar de 0 até 9, um número por segundo, e repetir.",
  "conceito": "O laço “para” conta de 0 até 9, e cada número contado vai para o display. A variável i guarda o algarismo da vez. A pausa de 1 segundo permite ler cada número antes de o próximo aparecer.",
  "resultado": "O display mostra 0, 1, 2… até 9, e volta ao 0 continuamente.",
  "desafio": "Faça o display contar de trás para frente, de 9 até 0 (dica: 9 − i).",
  "aviso": "Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).",
  "js": "let i = 0\nled.enable(false)\nbasic.forever(function () {\n    for (let i = 0; i <= 9; i++) {\n        sete_seg.mostrar(i)\n        basic.pause(1000)\n    }\n})\n",
  "py": "from microbit import *\nimport sete_seg\n\ni = 0\ndisplay.off()\n\nwhile True:\n    for i in range(10):\n        sete_seg.mostrar(i)\n        sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_para",
         "fields": {
          "VAR": {
           "id": "v_i"
          }
         },
         "inputs": {
          "ATE": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 9
            }
           }
          },
          "DO": {
           "block": {
            "type": "mb_7seg_mostrar",
            "inputs": {
             "N": {
              "block": {
               "type": "variables_get",
               "fields": {
                "VAR": {
                 "id": "v_i"
                }
               }
              }
             }
            },
            "next": {
             "block": {
              "type": "mb_pausa",
              "inputs": {
               "MS": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 1000
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "i",
     "id": "v_i"
    }
   ]
  }
 },
 {
  "numero": 84,
  "modulo": 16,
  "n": 4,
  "nome": "Contador com botão",
  "objetivo": "Some 1 no display a cada aperto do botão A, voltando a 0 depois do 9.",
  "conceito": "Um contador guarda o número em uma variável. Cada aperto soma 1; se passar de 9, volta a 0, porque o display só mostra um algarismo. Depois de mudar a variável, mostramos o valor no display. O botão B zera o contador.",
  "resultado": "Cada aperto de A soma 1 no display; depois do 9 volta para 0. O botão B zera.",
  "desafio": "Faça o botão B diminuir 1, sem passar de 0 para baixo.",
  "aviso": "Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).",
  "js": "let numero = 0\nled.enable(false)\nnumero = 0\nsete_seg.mostrar(0)\ninput.onButtonPressed(Button.A, function () {\n    numero += 1\n    if (numero > 9) {\n        numero = 0\n    }\n    sete_seg.mostrar(numero)\n})\ninput.onButtonPressed(Button.B, function () {\n    numero = 0\n    sete_seg.mostrar(0)\n})\n",
  "py": "from microbit import *\nimport sete_seg\n\ndisplay.off()\nnumero = 0\nsete_seg.mostrar(0)\n\nwhile True:\n    if button_a.was_pressed():\n        numero += 1\n        if numero > 9:\n            numero = 0\n        sete_seg.mostrar(numero)\n    if button_b.was_pressed():\n        numero = 0\n        sete_seg.mostrar(0)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_numero"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_7seg_mostrar",
           "inputs": {
            "N": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_numero"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "controls_if",
           "inputs": {
            "IF0": {
             "block": {
              "type": "logic_compare",
              "fields": {
               "OP": "GT"
              },
              "inputs": {
               "A": {
                "block": {
                 "type": "variables_get",
                 "fields": {
                  "VAR": {
                   "id": "v_numero"
                  }
                 }
                }
               },
               "B": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 9
                 }
                }
               }
              }
             }
            },
            "DO0": {
             "block": {
              "type": "mb_var_definir",
              "fields": {
               "VAR": {
                "id": "v_numero"
               }
              },
              "inputs": {
               "VALOR": {
                "block": {
                 "type": "math_number",
                 "fields": {
                  "NUM": 0
                 }
                }
               }
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_7seg_mostrar",
             "inputs": {
              "N": {
               "block": {
                "type": "variables_get",
                "fields": {
                 "VAR": {
                  "id": "v_numero"
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_numero"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_7seg_mostrar",
           "inputs": {
            "N": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "numero",
     "id": "v_numero"
    }
   ]
  }
 },
 {
  "numero": 85,
  "modulo": 16,
  "n": 5,
  "nome": "Desafio: dado eletrônico",
  "objetivo": "Sacuda a micro:bit e mostre um número de 1 a 6 no display, como um dado.",
  "conceito": "Aqui juntamos três ideias: um gesto (sacudir), um sorteio (número aleatório) e uma saída (o display). Cada sacudida joga o dado. Um dado de verdade tem só 6 faces, por isso sorteamos entre 1 e 6.",
  "resultado": "A cada sacudida, o display mostra um número sorteado de 1 a 6.",
  "desafio": "Faça uma animação antes de mostrar o resultado: passe por 3 números aleatórios rapidamente.",
  "aviso": "Use o display de 7 segmentos de CÁTODO comum: o pino comum vai no GND e cada segmento (de a até g, mais o ponto) vai em um pino da micro:bit, com um resistor de 220 Ω em cada um. Os pinos usados dividem espaço com a tela de LEDs, por isso o programa desliga a tela primeiro. Confira os pinos na tabela de ligações (Ajuda).",
  "js": "let dado = 0\nled.enable(false)\nsete_seg.apagar()\ninput.onGesture(Gesture.Shake, function () {\n    dado = randint(1, 6)\n    sete_seg.mostrar(dado)\n})\n",
  "py": "from microbit import *\nimport random\nimport sete_seg\n\ndado = 0\ndisplay.off()\nsete_seg.apagar()\n\nwhile True:\n    if accelerometer.was_gesture(\"shake\"):\n        dado = random.randint(1, 6)\n        sete_seg.mostrar(dado)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_7seg_apagar"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_gesto",
      "fields": {
       "G": "Shake"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_dado"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "mb_aleatorio",
            "inputs": {
             "DE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 1
               }
              }
             },
             "ATE": {
              "block": {
               "type": "math_number",
               "fields": {
                "NUM": 6
               }
              }
             }
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_7seg_mostrar",
           "inputs": {
            "N": {
             "block": {
              "type": "variables_get",
              "fields": {
               "VAR": {
                "id": "v_dado"
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "dado",
     "id": "v_dado"
    }
   ]
  }
 },
 {
  "numero": 86,
  "modulo": 17,
  "n": 1,
  "nome": "Olá, LCD!",
  "objetivo": "Escreva uma mensagem na primeira linha do LCD 16x2.",
  "conceito": "O LCD tem 2 linhas de 16 letras. O adaptador I2C usa só 2 fios de dados (SDA e SCL) para receber tudo o que queremos escrever. Primeiro iniciamos o LCD; depois escrevemos o texto informando a linha (0 é a de cima) e a coluna (0 é a primeira).",
  "resultado": "O LCD mostra Ola, mundo! na primeira linha.",
  "desafio": "Escreva o seu nome. Quantas letras cabem em uma linha?",
  "aviso": "O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.",
  "js": "lcd1602.iniciar()\nlcd1602.escrever(\"Ola, mundo!\", 0, 0)\n",
  "py": "from microbit import *\nimport lcd1602\n\nlcd1602.iniciar()\nlcd1602.escrever(\"Ola, mundo!\", 0, 0)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_iniciar",
         "next": {
          "block": {
           "type": "mb_lcd_escrever",
           "inputs": {
            "T": {
             "block": {
              "type": "text",
              "fields": {
               "TEXT": "Ola, mundo!"
              }
             }
            },
            "LIN": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            },
            "COL": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 87,
  "modulo": 17,
  "n": 2,
  "nome": "Duas linhas",
  "objetivo": "Escreva uma palavra em cada linha do LCD.",
  "conceito": "A segunda linha é a linha 1 (a contagem começa no 0). Também podemos escolher a coluna onde o texto começa: coluna 0 é o canto esquerdo e coluna 15 é o último quadradinho. Escrever em uma coluna maior empurra o texto para a direita.",
  "resultado": "O LCD mostra micro:bit na linha de cima e V2 na linha de baixo.",
  "desafio": "Centralize o texto: comece na coluna certa para ele ficar no meio.",
  "aviso": "O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.",
  "js": "lcd1602.iniciar()\nlcd1602.escrever(\"micro:bit\", 0, 0)\nlcd1602.escrever(\"V2\", 1, 0)\n",
  "py": "from microbit import *\nimport lcd1602\n\nlcd1602.iniciar()\nlcd1602.escrever(\"micro:bit\", 0, 0)\nlcd1602.escrever(\"V2\", 1, 0)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_iniciar",
         "next": {
          "block": {
           "type": "mb_lcd_escrever",
           "inputs": {
            "T": {
             "block": {
              "type": "text",
              "fields": {
               "TEXT": "micro:bit"
              }
             }
            },
            "LIN": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            },
            "COL": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_lcd_escrever",
             "inputs": {
              "T": {
               "block": {
                "type": "text",
                "fields": {
                 "TEXT": "V2"
                }
               }
              },
              "LIN": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1
                }
               }
              },
              "COL": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 88,
  "modulo": 17,
  "n": 3,
  "nome": "Termômetro no LCD",
  "objetivo": "Mostre a temperatura no LCD, atualizando uma vez por segundo.",
  "conceito": "Para juntar texto e número usamos “juntar”: o texto “Temp: ”, o valor e “C” formam uma mensagem só. Como o texto novo pode ser mais curto que o velho, limpamos o LCD antes de escrever, senão ficam letras sobrando da leitura anterior.",
  "resultado": "O LCD mostra, por exemplo, Temp: 24 C, e a linha é refeita a cada segundo.",
  "desafio": "Mostre também a luz na segunda linha.",
  "aviso": "O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.",
  "js": "lcd1602.iniciar()\nbasic.forever(function () {\n    lcd1602.limpar()\n    lcd1602.escrever(\"Temp: \" + input.temperature() + \" C\", 0, 0)\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\nimport lcd1602\n\nlcd1602.iniciar()\n\nwhile True:\n    lcd1602.limpar()\n    lcd1602.escrever(\"Temp: \" + str(temperature()) + \" C\", 0, 0)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_iniciar"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_limpar",
         "next": {
          "block": {
           "type": "mb_lcd_escrever",
           "inputs": {
            "T": {
             "block": {
              "type": "text_join",
              "extraState": {
               "itemCount": 3
              },
              "inputs": {
               "ADD0": {
                "block": {
                 "type": "text",
                 "fields": {
                  "TEXT": "Temp: "
                 }
                }
               },
               "ADD1": {
                "block": {
                 "type": "mb_temperatura"
                }
               },
               "ADD2": {
                "block": {
                 "type": "text",
                 "fields": {
                  "TEXT": " C"
                 }
                }
               }
              }
             }
            },
            "LIN": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            },
            "COL": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_pausa",
             "inputs": {
              "MS": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1000
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 },
 {
  "numero": 89,
  "modulo": 17,
  "n": 4,
  "nome": "Contador no LCD",
  "objetivo": "Conte os apertos do botão A e mostre o total no LCD.",
  "conceito": "Cada aperto do botão A soma 1 em uma variável. O LCD é limpo e reescrito com o novo total. Um LCD faz a mesma função que a tela de LEDs, mas com muito mais espaço: cabe uma frase inteira em vez de um número por vez.",
  "resultado": "O LCD mostra “Cliques: N”, e N sobe a cada aperto de A. O botão B zera.",
  "desafio": "Escreva “Ola!” na segunda linha quando o total chegar a 10.",
  "aviso": "O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.",
  "js": "let cliques = 0\nlcd1602.iniciar()\ncliques = 0\nlcd1602.escrever(\"Cliques: 0\", 0, 0)\ninput.onButtonPressed(Button.A, function () {\n    cliques += 1\n    lcd1602.limpar()\n    lcd1602.escrever(\"Cliques: \" + cliques, 0, 0)\n})\ninput.onButtonPressed(Button.B, function () {\n    cliques = 0\n    lcd1602.limpar()\n    lcd1602.escrever(\"Cliques: 0\", 0, 0)\n})\n",
  "py": "from microbit import *\nimport lcd1602\n\nlcd1602.iniciar()\ncliques = 0\nlcd1602.escrever(\"Cliques: 0\", 0, 0)\n\nwhile True:\n    if button_a.was_pressed():\n        cliques += 1\n        lcd1602.limpar()\n        lcd1602.escrever(\"Cliques: \" + str(cliques), 0, 0)\n    if button_b.was_pressed():\n        cliques = 0\n        lcd1602.limpar()\n        lcd1602.escrever(\"Cliques: 0\", 0, 0)\n    sleep(20)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_iniciar",
         "next": {
          "block": {
           "type": "mb_var_definir",
           "fields": {
            "VAR": {
             "id": "v_cliques"
            }
           },
           "inputs": {
            "VALOR": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_lcd_escrever",
             "inputs": {
              "T": {
               "block": {
                "type": "text",
                "fields": {
                 "TEXT": "Cliques: 0"
                }
               }
              },
              "LIN": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              },
              "COL": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "A"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_mudar",
         "fields": {
          "VAR": {
           "id": "v_cliques"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 1
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_lcd_limpar",
           "next": {
            "block": {
             "type": "mb_lcd_escrever",
             "inputs": {
              "T": {
               "block": {
                "type": "text_join",
                "extraState": {
                 "itemCount": 2
                },
                "inputs": {
                 "ADD0": {
                  "block": {
                   "type": "text",
                   "fields": {
                    "TEXT": "Cliques: "
                   }
                  }
                 },
                 "ADD1": {
                  "block": {
                   "type": "variables_get",
                   "fields": {
                    "VAR": {
                     "id": "v_cliques"
                    }
                   }
                  }
                 }
                }
               }
              },
              "LIN": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              },
              "COL": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     },
     {
      "x": 20,
      "y": 460,
      "type": "mb_ao_botao",
      "fields": {
       "BTN": "B"
      },
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_var_definir",
         "fields": {
          "VAR": {
           "id": "v_cliques"
          }
         },
         "inputs": {
          "VALOR": {
           "block": {
            "type": "math_number",
            "fields": {
             "NUM": 0
            }
           }
          }
         },
         "next": {
          "block": {
           "type": "mb_lcd_limpar",
           "next": {
            "block": {
             "type": "mb_lcd_escrever",
             "inputs": {
              "T": {
               "block": {
                "type": "text",
                "fields": {
                 "TEXT": "Cliques: 0"
                }
               }
              },
              "LIN": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              },
              "COL": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   },
   "variables": [
    {
     "name": "cliques",
     "id": "v_cliques"
    }
   ]
  }
 },
 {
  "numero": 90,
  "modulo": 17,
  "n": 5,
  "nome": "Desafio: painel de sensores",
  "objetivo": "Monte um painel: a luz na primeira linha e a temperatura na segunda.",
  "conceito": "Um painel de instrumentos mostra vários sensores ao mesmo tempo: cada valor em uma linha, com o nome ao lado. Usando o mesmo laço para ler e mostrar tudo, o painel se atualiza sozinho. É o embrião de uma estação meteorológica.",
  "resultado": "A linha 1 mostra “Luz: 120” e a linha 2 mostra “Temp: 24 C”, atualizadas a cada segundo.",
  "desafio": "Acrescente o nível de som e alterne entre duas telas a cada aperto do botão A.",
  "aviso": "O LCD com adaptador I2C usa 4 fios: GND, VCC, SDA (P20) e SCL (P19). Muitos modelos precisam de 5 V no VCC (use a saída de 5 V do adaptador). O endereço mais comum é 0x27; alguns módulos usam 0x3F. O contraste é regulado no parafuso azul atrás do LCD: se aparecerem só quadradinhos ou nada, gire-o. Só escreva letras sem acento e símbolos simples.",
  "js": "lcd1602.iniciar()\nbasic.forever(function () {\n    lcd1602.limpar()\n    lcd1602.escrever(\"Luz: \" + input.lightLevel(), 0, 0)\n    lcd1602.escrever(\"Temp: \" + input.temperature() + \" C\", 1, 0)\n    basic.pause(1000)\n})\n",
  "py": "from microbit import *\nimport lcd1602\n\nlcd1602.iniciar()\n\nwhile True:\n    lcd1602.limpar()\n    lcd1602.escrever(\"Luz: \" + str(display.read_light_level()), 0, 0)\n    lcd1602.escrever(\"Temp: \" + str(temperature()) + \" C\", 1, 0)\n    sleep(1000)\n",
  "blocos": {
   "blocks": {
    "languageVersion": 0,
    "blocks": [
     {
      "x": 20,
      "y": 20,
      "type": "mb_no_iniciar",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_iniciar"
        }
       }
      }
     },
     {
      "x": 20,
      "y": 240,
      "type": "mb_sempre",
      "inputs": {
       "DO": {
        "block": {
         "type": "mb_lcd_limpar",
         "next": {
          "block": {
           "type": "mb_lcd_escrever",
           "inputs": {
            "T": {
             "block": {
              "type": "text_join",
              "extraState": {
               "itemCount": 2
              },
              "inputs": {
               "ADD0": {
                "block": {
                 "type": "text",
                 "fields": {
                  "TEXT": "Luz: "
                 }
                }
               },
               "ADD1": {
                "block": {
                 "type": "mb_luz"
                }
               }
              }
             }
            },
            "LIN": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            },
            "COL": {
             "block": {
              "type": "math_number",
              "fields": {
               "NUM": 0
              }
             }
            }
           },
           "next": {
            "block": {
             "type": "mb_lcd_escrever",
             "inputs": {
              "T": {
               "block": {
                "type": "text_join",
                "extraState": {
                 "itemCount": 3
                },
                "inputs": {
                 "ADD0": {
                  "block": {
                   "type": "text",
                   "fields": {
                    "TEXT": "Temp: "
                   }
                  }
                 },
                 "ADD1": {
                  "block": {
                   "type": "mb_temperatura"
                  }
                 },
                 "ADD2": {
                  "block": {
                   "type": "text",
                   "fields": {
                    "TEXT": " C"
                   }
                  }
                 }
                }
               }
              },
              "LIN": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 1
                }
               }
              },
              "COL": {
               "block": {
                "type": "math_number",
                "fields": {
                 "NUM": 0
                }
               }
              }
             },
             "next": {
              "block": {
               "type": "mb_pausa",
               "inputs": {
                "MS": {
                 "block": {
                  "type": "math_number",
                  "fields": {
                   "NUM": 1000
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    ]
   }
  }
 }
];
