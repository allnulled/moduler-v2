# Situación

El compilador está evaluando ahora mismo las factories y files y todo.

Y no es la idea, la idea es que eso se quede sin ejecutar, pero con las cabeceras pueda resolver todo el mapa de dependencias.


# Tareas

- Con el compilador
   - [ ] Conseguir que el $moduler.define se inyecte




- [ ] empezar clase ModulerV2Compiler como extends de ModulerV2
   - [ ] sobreescribir método resolveModule solamente
      - [ ] para que guarde la información de todos los módulos
      - [ ] en 2 pasos como rollup:
         - [ ] bundler: devuelve bundle
         - [ ] writer: el bundle se autopersiste
         - [ ] esto permitirá usar el bundle para otras cosas que no sean persistir:
            - [ ] análisis de dependencias
            - [ ] análisis de código principalmente, pero que no es poco
      - [ ] tiene que permitir que:
         - [ ] el bundler funcione en entorno web igual que en node.js
            - [ ] es el writer el que se opiniona a node.js
         - [ ] vale, y seguimos desde aquí para adelante