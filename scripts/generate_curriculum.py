import json
import os

tmpdir = os.environ.get('TMPDIR', '/data/data/com.termux/files/usr/tmp')
scraped_path = os.path.join(tmpdir, 'scraped_units.json')

if not os.path.exists(scraped_path):
    print("Scraped path not found")
    exit(1)

with open(scraped_path, 'r', encoding='utf-8') as f:
    scraped = json.load(f)

terms_meta = {
    1: {
        'title': 'Fundamentos del Trazo, Perspectiva y Composición',
        'subtitle': 'Construye la base inquebrantable de tu dibujo',
        'estimatedWeeks': 12,
        'description': 'Aprende a dibujar con soltura y sin rigidez mediante el gesto dinámico, domina las leyes de la perspectiva lineal con Drawabox y aprende a componer escenas con peso visual.',
        'color': 'from-amber-500 to-orange-600',
        'icon': 'Compass',
        'gradPrompt': {
            'title': 'Obra de Graduación: Figura en Perspectiva con Composición Tonal',
            'brief': 'Crea una ilustración completa de una figura humana en una pose dinámica situada dentro de un entorno arquitectónico simple con perspectiva de 1 o 2 puntos y valores de gris definidos.',
            'requirements': [
                'Línea de acción clara y proporciones coherentes',
                'Entorno con horizonte y puntos de fuga alineados',
                'Jerarquía de valores tonales (foco en blanco, gris y negro)',
                'Sin sombreado excesivo: prioriza la estructura volumétrica'
            ],
            'tips': [
                'Haz 3 miniaturas (thumbnails) antes de comenzar el dibujo definitivo.',
                'Utiliza el temporizador de gestos para aflojar la mano antes del trazo final.'
            ]
        }
    },
    2: {
        'title': 'Anatomía de Cabeza, Torso y Perspectiva Intermedia',
        'subtitle': 'Estructura el cuerpo humano en volúmenes 3D',
        'estimatedWeeks': 12,
        'description': 'Domina el método Loomis para dibujar cabezas y rostros en cualquier ángulo, desglosa la caja torácica y pelvis, y aprende la rotación de cilindros y curvas en perspectiva.',
        'color': 'from-blue-500 to-indigo-600',
        'icon': 'UserCheck',
        'gradPrompt': {
            'title': 'Obra de Graduación: Busto y Torso Dinámico en Perspectiva',
            'brief': 'Dibuja un busto completo (cabeza, cuello, torso y hombros) en ángulo dramático de tres cuartos o contrapicado, evidenciando planos faciales y torsión de masas.',
            'requirements': [
                'Construcción de cráneo y mandíbula mediante método Loomis / Asaro',
                'Caja torácica y pelvis con torsión visible (contrapposto)',
                'Rasgos faciales integrados en planos volumétricos',
                'Líneas de ritmo conectando el torso con los hombros'
            ],
            'tips': [
                'Dibuja primero la caja torácica como una caja elipsoidal antes de poner los pectorales.',
                'Asegúrate de que la línea media de la cara siga la curvatura de la esfera.'
            ]
        }
    },
    3: {
        'title': 'Extremidades Superiores, Manos, Ropa y 3 Puntos de Fuga',
        'subtitle': 'Conquista las manos complejas, pliegues y vistas dramáticas',
        'estimatedWeeks': 12,
        'description': 'Descifra la anatomía de brazos y manos, comprende la física del ropaje y sus puntos de tensión, y domina la perspectiva de 3 puntos de fuga (vistas picadas y contrapicadas).',
        'color': 'from-purple-500 to-pink-600',
        'icon': 'Layers',
        'gradPrompt': {
            'title': 'Obra de Graduación: Figura Vestida en Acción con Perspectiva de 3 Puntos',
            'brief': 'Ilustra un personaje con ropa y ropaje en una pose de acción o movimiento con vista en perspectiva de 3 puntos, mostrando manos expresivas y pliegues naturales.',
            'requirements': [
                'Manos estructuradas correctamente con planos de nudillos y dedos articulados',
                'Ropaje con al menos 3 tipos de pliegues (tubo, zigzag, pañal o espiral)',
                'Perspectiva de 3 puntos evidente en la figura y el suelo',
                'Sensación de peso y caída de tela sobre el cuerpo'
            ],
            'tips': [
                'Recuerda que la tela no tiene forma propia: solo revela la forma sólida que cubre.',
                'Utiliza líneas de convergencia al tercer punto de fuga cenital o nadir.'
            ]
        }
    },
    4: {
        'title': 'Color, Luz Fundamental y Extremidades Inferiores',
        'subtitle': 'Pinta con luz y conecta la figura a la tierra',
        'estimatedWeeks': 12,
        'description': 'Aprende la anatomía de piernas y pies, la física de la luz (terminador, luces directas, sombras y rebotes) y las bases de la teoría del color y armonías cromáticas.',
        'color': 'from-amber-500 to-yellow-600',
        'icon': 'Sun',
        'gradPrompt': {
            'title': 'Obra de Graduación: Figura Completa con Iluminación Direccional y Color',
            'brief': 'Pinta una figura de cuerpo entero conectada al suelo con una fuente de luz direccional clara, aplicando armonía cromática y jerarquía de valores de sombra y luz.',
            'requirements': [
                'Piernas y pies bien plantados en perspectiva sobre el plano de tierra',
                'Separación nítida entre la zona de luz y la zona de sombra (terminador)',
                'Presencia de luz rebotada (ambient occlusion y bounce light)',
                'Paleta de color limitada con dominante y acento'
            ],
            'tips': [
                'Mantén tus sombras más simples que tus luces: no pongas excesivos detalles en la oscuridad.',
                'El color de la sombra suele ser el complementario del color de la luz principal.'
            ]
        }
    },
    5: {
        'title': 'Anatomía Animal, Lentes de Cámara y Luz Avanzada',
        'subtitle': 'Expande tus horizontes hacia el reino animal y la óptica',
        'estimatedWeeks': 12,
        'description': 'Estudia la anatomía comparada de cuadrúpedos y animales, comprende la distorsión de lentes fotográficas y profundiza en materiales y dispersión subsuperficial.',
        'color': 'from-emerald-500 to-teal-600',
        'icon': 'Sparkles',
        'gradPrompt': {
            'title': 'Obra de Graduación: Ilustración Animal / Criatura en Entorno Iluminado',
            'brief': 'Dibuja o pinta un animal (o criatura biológicamente creíble) en su hábitat natural, empleando perspectiva con lente focal y renderizado de textura de piel, pelaje o escamas.',
            'requirements': [
                'Anatomía comparada precisa (homología de articulaciones: escápula, rodilla, talón)',
                'Perspectiva de cámara consistente con la lente elegida',
                'Tratamiento convincente de materiales (pelaje mate, brillo ocular o escamas)',
                'Sensación de profundidad atmosférica en el entorno'
            ],
            'tips': [
                'Compara siempre el esqueleto animal con el humano para entender dónde dobla cada articulación.',
                'Observa cómo la luz se filtra a través de orejas u hojas (dispersión subsuperficial).'
            ]
        }
    },
    6: {
        'title': 'Diseño de Personajes, Narrativa y Espacios Habitados',
        'subtitle': 'Crea personajes memorables que cuenten historias vivas',
        'estimatedWeeks': 12,
        'description': 'Domina el lenguaje de formas (círculo, cuadrado, triángulo), diseña siluetas legibles, crea hojas de turnaround de personajes y sitúalos en interiores complejos.',
        'color': 'from-rose-500 to-red-600',
        'icon': 'Palette',
        'gradPrompt': {
            'title': 'Obra de Graduación: Hoja de Diseño de Personaje (Model Sheet) + Escena Narrativa',
            'brief': 'Crea un diseño de personaje original con su hoja de giros (turnaround frontal, 3/4 y lateral) junto con una ilustración narrativa del personaje interactuando en su habitación o taller.',
            'requirements': [
                'Silueta distintiva reconocible en negro sólido',
                'Lenguaje de formas coherente que refleje la personalidad',
                'Turnaround con proporciones exactas en todas las vistas',
                'Escena de interior con props que refuercen la historia del personaje'
            ],
            'tips': [
                'Prueba la prueba de la silueta: si rellenas tu personaje de negro, ¿aún sabes quién es y qué hace?',
                'Cada objeto en el fondo debe decir algo sobre la persona que vive allí.'
            ]
        }
    },
    7: {
        'title': 'Anatomía de Imaginación y Diseño de Entornos',
        'subtitle': 'Dibuja sin ataduras desde tu mente y diseña mundos épicos',
        'estimatedWeeks': 12,
        'description': 'Aprende a rotar y articular figuras anatómicas desde la imaginación sin referencias directas, domina el diseño de entornos mediante miniaturas, planos de profundidad y megaestructuras.',
        'color': 'from-cyan-500 to-blue-600',
        'icon': 'Mountain',
        'gradPrompt': {
            'title': 'Obra de Graduación: Paisaje Épico / Ciudad con Personaje a Escala',
            'brief': 'Diseña un entorno monumental (exterior natural o metrópoli arquitectónica) con 3 planos de profundidad claros y un personaje dibujado desde la imaginación colocado a escala.',
            'requirements': [
                'Figura dibujada desde la imaginación en escorzo creíble',
                'Diseño de entorno con primer plano, plano medio y fondo con perspectiva atmosférica',
                'Escala visual legible mediante elementos de referencia (puertas, escaleras, vegetación)',
                'Composición con líneas de fuga que guíen al espectador al punto focal'
            ],
            'tips': [
                'Usa planos de valor: oscuro en primer plano, gris en plano medio y claro en el fondo (o viceversa).',
                'No detalles todo por igual; concentra el detalle fino en el punto de mayor contraste.'
            ]
        }
    },
    8: {
        'title': 'Entornos con Atmósfera, Pintura I y Caricatura',
        'subtitle': 'Domina el clima, la estilización y las primeras capas de color',
        'estimatedWeeks': 12,
        'description': 'Pinta atmósferas climáticas (niebla, lluvia, atardeceres dorados), explora las técnicas iniciales de pintura digital y experimenta con la caricatura y la estilización extrema.',
        'color': 'from-fuchsia-500 to-purple-600',
        'icon': 'Brush',
        'gradPrompt': {
            'title': 'Obra de Graduación: Ilustración Atmosférica Estilizada de Alta Intensidad',
            'brief': 'Produce una ilustración con fuerte carga atmosférica y lumínica (ej. tormenta, hora dorada o noche lluviosa con luces de neón) aplicando estilización de formas y bordes de pintura cuidados.',
            'requirements': [
                'Condición climática o lumínica atmosférica dominante y envolvente',
                'Personaje o criatura estilizado con exageración controlada de proporciones',
                'Manejo de bordes duros, suaves y perdidos en la pintura',
                'Lectura clara de la silueta a pesar de los efectos climáticos'
            ],
            'tips': [
                'La niebla y la lluvia reducen el contraste a medida que los objetos se alejan.',
                'Utiliza bordes perdidos donde la sombra del objeto se funda con el fondo para crear misterio.'
            ]
        }
    },
    9: {
        'title': 'Pintura Avanzada, Matte Painting y Proyecto Capstone',
        'subtitle': 'La culminación del camino: tu gran obra maestra',
        'estimatedWeeks': 12,
        'description': 'Perfecciona el renderizado de texturas y materiales de nivel profesional, realiza estudios de maestros clásicos, y crea tu proyecto personal de portafolio que demuestre toda tu evolución.',
        'color': 'from-amber-400 via-rose-500 to-purple-600',
        'icon': 'Trophy',
        'gradPrompt': {
            'title': 'Obra de Graduación Final: Obra Maestra del Portafolio y Comparativa Épica',
            'brief': 'Crea tu pieza cumbre definitiva que reúna figura humana, perspectiva rigurosa, composición cinematográfica, diseño original y renderizado de pintura completo. Luego súbela al estudio de evolución para compararla con tu dibujo de Nivel 0.',
            'requirements': [
                'Ilustración completa de nivel profesional con acabado pulido',
                'Narrativa visual clara y original',
                'Integración impecable de todos los fundamentos de los 9 términos',
                'Reflexión profunda escrita sobre tu viaje artístico desde el inicio'
            ],
            'tips': [
                'Dedica el tiempo necesario a esta pieza (20 a 50 horas de trabajo sin prisa).',
                'Abre tu dibujo de Nivel 0 al lado mientras pintas para maravillarte del salto que has dado.'
            ]
        }
    }
}

unit_checks_map = {
    1: [
        ('Dominio del Gesto: 50 poses de 30 segundos', 'Práctica diaria de captura rápida de ritmo y línea de acción con Croquis Cafe o Line of Action.', 50, '30 min', ['gesto', 'ritmo']),
        ('Estructura de Masas: 20 poses de 2 minutos', 'Identificación de la línea de acción, eje de hombros vs eje de pelvis y contrapposto.', 20, '45 min', ['estructura', 'masas']),
        ('Proporciones de Loomis: Estudio de 8 cabezas', 'Dibuja figuras de frente, perfil y tres cuartos marcando las divisiones anatómicas estándar.', 5, '30 min', ['proporciones', 'anatomía']),
        ('Reto Croquis Cafe 30 días (Semana 1)', 'Completa las primeras sesiones diarias de Croquis Cafe y documenta tu soltura.', 7, '30 min/día', ['reto', 'hábito'])
    ],
    2: [
        ('Drawabox Lección 0 & 1: Líneas fantasma y elipses', 'Práctica de líneas rectas con el hombro, planos divididos y elipses en embudos.', 10, '1 hora', ['drawabox', 'control']),
        ('250 Box Challenge (Fase 1: Primeras 50 cajas)', 'Dibuja 50 cajas libres en perspectiva con puntos de fuga extendidos para verificar convergencia.', 50, '2 horas', ['perspectiva', 'cajas']),
        ('Perspectiva de 1 y 2 Puntos: Cuadrículas y cubos', 'Construye un espacio interior con horizonte, 1 y 2 puntos de fuga y cubos rotados.', 5, '45 min', ['cuadrícula', 'espacio']),
        ('250 Cylinder Challenge (Fase 1: 30 cilindros)', 'Dibuja cilindros en diferentes ángulos verificando el grado de apertura de las elipses.', 30, '1 hora', ['cilindros', 'elipses'])
    ],
    3: [
        ('Thumbnails de Películas: 25 miniaturas cinematográficas', 'Analiza escenas de películas clásicas descomponiéndolas en 3 valores (blanco, gris, negro).', 25, '1 hora', ['composición', 'cine']),
        ('Regla de Tercios y Puntos Focales', 'Diseña 5 composiciones donde el ojo del espectador sea guiado inequívocamente al punto focal.', 5, '45 min', ['puntos-focales', 'flujo']),
        ('Dibujo Iterativo (Reto Sycra): 1 idea x 10 variaciones', 'Toma una idea simple y dibuja 10 variaciones compositivas extremas buscando la más potente.', 10, '1 hora', ['iterativo', 'creatividad']),
        ('Jerarquía de Valores Tonales: Notan blanco y negro', 'Crea 5 estudios en blanco y negro puro (Notan) buscando siluetas atractivas.', 5, '30 min', ['notan', 'valores'])
    ],
    4: [
        ('Método Loomis: Esfera y mandíbula en 10 ángulos', 'Construye la esfera base, corte de planos temporales, eje central y mandíbula rotada.', 10, '1 hora', ['loomis', 'cabeza']),
        ('Planos de la Cabeza: Estudio de la cabeza Asaro', 'Dibuja la cabeza Asaro identificando los cambios de plano de frente, perfil y 3/4.', 6, '1 hora', ['asaro', 'planos']),
        ('Rasgos Faciales Aislados: Ojos, nariz, boca y orejas', 'Dibuja 10 pares de ojos, 10 narices, 10 bocas y 10 orejas en perspectiva tridimensional.', 40, '1.5 horas', ['rasgos', 'detalle']),
        ('Retrato Realista desde Fotografía o Espejo', 'Aplica el método Loomis y los planos para dibujar un autorretrato fidedigno.', 2, '1 hora', ['retrato', 'estudio'])
    ],
    5: [
        ('Intersección de Formas Complejas (Caja + Cilindro + Esfera)', 'Dibuja volúmenes penetrándose entre sí y traza las líneas de corte en perspectiva.', 8, '1 hora', ['intersección', 'volumen']),
        ('Curvas en Perspectiva: Método de la caja envolvente', 'Dibuja formas orgánicas y curvadas encerrándolas primero en cajas geométricas.', 10, '45 min', ['curvas', 'envolvente']),
        ('Cilindros Rotados en Espacio Libre (50 cilindros)', 'Dibuja cilindros cayendo en el espacio en todas las orientaciones imaginables.', 50, '1.5 horas', ['cilindros', 'rotación']),
        ('Drawabox Lección 2: Texturas orgánicas y piel', 'Dibuja texturas aplicadas a formas cilíndricas respetando la curvatura de la superficie.', 5, '1 hora', ['textura', 'drawabox'])
    ],
    6: [
        ('Caja Torácica vs Pelvis: Estudio de la judía (Bean shape)', 'Dibuja 30 torsos usando la forma del frijol/judía para capturar torsión y flexión.', 30, '45 min', ['torso', 'bean']),
        ('Caja Torácica y Huesos Guía (Esternón, clavículas, pelvis)', 'Construye la caja torácica como volumen sólido y asienta las clavículas y crestas ilíacas.', 15, '1 hora', ['esqueleto', 'estructura']),
        ('Musculatura del Torso: Pectorales, rectos y dorsales', 'Inserta los músculos principales del torso comprendiendo su origen e inserción ósea.', 10, '1 hora', ['músculos', 'anatomía']),
        ('Espalda y Cuello: Trapecios y columna vertebral', 'Dibuja el dorso humano prestando atención a la forma de diamante del trapecio.', 10, '1 hora', ['espalda', 'columna'])
    ],
    7: [
        ('Cuadrícula de 3 Puntos de Fuga (Cenital y Nadir)', 'Construye una cuadrícula de 3 puntos de fuga y dibuja 5 edificios con vista de pájaro y de gusano.', 5, '1.5 horas', ['3-puntos', 'edificios']),
        ('Planos Inclinados y Rampas en Perspectiva', 'Calcula puntos de fuga auxiliares para dibujar escaleras, rampas y tejados inclinados.', 6, '1 hora', ['rampas', 'escaleras']),
        ('Rotación de Objetos Alrededor de un Eje Central', 'Dibuja una puerta o ventana abriéndose en 5 ángulos consecutivos con arcos precisos.', 5, '45 min', ['rotación', 'ejes']),
        ('Escena Urbana en Ángulo Contrapicado Extremo', 'Ilustra una calle mirando hacia arriba donde los rascacielos converjan dramáticamente.', 1, '2 horas', ['ciudad', 'contrapicado'])
    ],
    8: [
        ('Hombro y Deltoides: La copa que abraza el brazo', 'Dibuja la articulación del hombro con el deltoides en 10 ángulos distintos de elevación.', 10, '45 min', ['hombro', 'deltoides']),
        ('Bíceps, Tríceps y Braquial: Mecánica de flexión', 'Estudia el brazo en tensión y reposo marcando el relieve de flexores y extensores.', 12, '1 hora', ['brazo', 'músculos']),
        ('Antebrazo y Pronación / Supinación', 'Comprende el giro del radio sobre el cúbito al rotar la palma de la mano.', 10, '1 hora', ['antebrazo', 'torsión']),
        ('Manos: Anatomía de la palma, arcos y falanges', 'Dibuja 20 manos en poses complejas usando cajas para la palma y cilindros para los dedos.', 20, '1.5 horas', ['manos', 'dedos'])
    ],
    9: [
        ('Los 7 Tipos de Pliegues de Burne Hogarth', 'Dibuja ejemplos claros de pliegues en tubo, zigzag, espiral, pañal, gota e inertes.', 14, '1.5 horas', ['pliegues', 'ropa']),
        ('Puntos de Tensión y Caída por Gravedad', 'Dibuja prendas sueltas identificando los hombros, codos o rodillas como puntos de anclaje.', 10, '1 hora', ['tensión', 'gravedad']),
        ('Diferenciación de Telas: Denim, seda y cuero', 'Dibuja el mismo pantalón o chaqueta en 3 tipos de tela con pliegues rígidos vs suaves.', 3, '1 hora', ['materiales', 'telas']),
        ('Estudio de Figura Vestida al Natural o Referencia', 'Dibuja una persona con ropa de invierno y arrugas complejas.', 3, '1 hora', ['figura', 'vestida'])
    ],
    10: [
        ('Rueda de Color y Armonías: Análogas y complementarias', 'Pinta círculos cromáticos y esquemas complementarios, divididos y triádicos.', 4, '45 min', ['color', 'rueda']),
        ('Jerarquía de Valores: Escala de grises de 9 pasos', 'Construye una escala de valores precisa del blanco al negro puro.', 2, '30 min', ['valores', 'escala']),
        ('La Fórmula de la Luz: Luz propia, terminador y sombra proyectada', 'Ilumina una esfera, un cilindro y un cubo con luz dura identificando cada elemento.', 3, '1 hora', ['luz', 'sombras']),
        ('Estudio Master de Marco Bucci sobre Saturación', 'Haz 2 estudios de color analizando cómo la saturación cambia en la frontera de sombra.', 2, '1 hora', ['marco-bucci', 'saturación'])
    ],
    11: [
        ('Curvas Complejas: Secciones transversales en perspectiva', 'Construye cuerpos aerodinámicos y curvas orgánicas con costillas o contornos transversales.', 8, '1 hora', ['curvas', 'contornos']),
        ('Vehículo Básico en Perspectiva (Drawabox Lección 7)', 'Dibuja un automóvil básico bloqueando primero su caja proporcional y ruedas elípticas.', 2, '2 horas', ['vehículos', 'drawabox']),
        ('Proyección de Sombras en Perspectiva con Fuente de Luz', 'Calcula la sombra arrojada de objetos sobre el suelo y paredes usando el punto de luz.', 6, '1 hora', ['sombras', 'proyección']),
        ('Interiores con Objetos Curvos (Muebles, lámparas)', 'Dibuja una habitación con mobiliario curvo integrado en perspectiva.', 2, '1.5 horas', ['muebles', 'interior'])
    ],
    12: [
        ('Conexión Pelvis-Fémur: Trocánter mayor y glúteos', 'Dibuja la articulación de la cadera y la masa de los glúteos en flexión y extensión.', 10, '45 min', ['cadera', 'glúteos']),
        ('Muslo y Rodilla: Cuádriceps, sartorio y rótula', 'Dibuja la rodilla como una bisagra con tendón rotuliano y almohadillas grasas.', 12, '1 hora', ['rodilla', 'pierna']),
        ('Pantorrilla: Gastrocnemio y sóleo', 'Estudia la asimetría de la pantorrilla (gemelo interno más bajo que el externo).', 10, '45 min', ['pantorrilla', 'gemelos']),
        ('Pies: Estructura del puente, talón y metatarsos en perspectiva', 'Dibuja 15 pies en vista frontal, perfil, suelo y ángulo contrapicado.', 15, '1.5 horas', ['pies', 'estructura'])
    ],
    13: [
        ('Anatomía Comparada: Humano vs Canino vs Felino', 'Dibuja los esqueletos comparando escápula, codo, rodilla y tobillo levantado.', 3, '1.5 horas', ['comparada', 'animal']),
        ('Estructura de Cuadrúpedos: El maniquí animal', 'Construye perros y caballos con cajas simples para caja torácica, pelvis y cráneo.', 15, '1 hora', ['cuadrúpedos', 'maniquí']),
        ('Cabezas Animales: Cráneos y ojos laterales vs frontales', 'Dibuja cráneos de herbívoros (ojos laterales) y depredadores (ojos frontales).', 8, '1 hora', ['cráneos', 'animales']),
        ('Estudios de Movimiento Animal: Gesto de animales en carrera', 'Dibuja 20 gestos de animales en acción (guepardo, caballo, águila).', 20, '45 min', ['gesto-animal', 'ritmo'])
    ],
    14: [
        ('Lentes Fotográficas: Gran Angular (14mm) vs Teleobjetivo (200mm)', 'Dibuja el mismo objeto en plano general con lente ultra gran angular y con teleobjetivo.', 2, '1.5 horas', ['lentes', 'óptica']),
        ('Distorsión Curvilínea (Perspectiva de 4 y 5 Puntos)', 'Crea una escena en ojo de pez (curvilinear perspective) con líneas que se curvan hacia los polos.', 2, '2 horas', ['ojo-de-pez', '5-puntos']),
        ('Ángulos Holandeses y Cámara Cinemática', 'Diseña 3 viñetas dramáticas con cámara inclinada (Dutch angle) aumentando la tensión.', 3, '1 hora', ['cámara', 'cinematografía']),
        ('Escala y Compresión Espacial', 'Ilustra una calle con teleobjetivo mostrando cómo el fondo parece comprimirse contra el frente.', 1, '1.5 horas', ['compresión', 'espacio'])
    ],
    15: [
        ('Perspectiva Atmosférica: Caída de contraste y cambio de matiz', 'Pinta capas montañosas donde los planos más lejanos pierdan saturación y adquieran tinte celeste.', 3, '1 hora', ['atmósfera', 'profundidad']),
        ('Subsurface Scattering (Dispersión Subsuperficial)', 'Pinta una oreja o una vela donde la luz penetre y se disperse en un resplandor cálido translúcido.', 2, '1 hora', ['sss', 'piel']),
        ('Render de Materiales: Mate vs Metálico vs Cristal', 'Pinta esferas de diferentes materiales: madera opaca, cromo reflectante y vidrio transparente.', 3, '1.5 horas', ['materiales', 'texturas']),
        ('Luz Rebotada y Luz Ambiental (Skylight)', 'Ilumina un objeto con luz de sol cálida y sombra teñida de azul por el cielo.', 2, '1 hora', ['luz-ambiental', 'skylight'])
    ],
    16: [
        ('Exploración de Siluetas: 20 conceptos en negro sólido', 'Diseña 20 siluetas de personajes variando proporciones corporales y accesorios.', 20, '1 hora', ['silueta', 'concept-art']),
        ('Lenguaje de Formas Psicológico (Héroe vs Villano)', 'Diseña un personaje bonachón (círculos) y un antagonista peligroso (triángulos/puntas).', 2, '1.5 horas', ['formas', 'psicología']),
        ('Hoja de Turnaround de Personaje (Frontal, Perfil, 3/4)', 'Crea una hoja de modelo limpia de tu personaje manteniendo proporciones exactas.', 3, '2 horas', ['turnaround', 'modelo']),
        ('Expresiones Faciales: Hoja de 6 emociones básicas', 'Dibuja al personaje sintiendo ira, alegría, sorpresa, tristeza, asco y concentración.', 6, '1 hora', ['expresiones', 'actuación'])
    ],
    17: [
        ('Staging y Regla de la Claridad Visual', 'Dibuja una escena de conflicto donde cada personaje tenga una silueta legible sin confusión.', 2, '1.5 horas', ['staging', 'claridad']),
        ('Encuadre Cinematográfico (Plano general, medio, primer plano)', 'Cuenta una pequeña historia de 3 viñetas variando la distancia focal.', 3, '1 hora', ['encuadre', 'narrativa']),
        ('Líneas Guía Ocultas (Leading Lines)', 'Diseña una composición donde la arquitectura y sombras apunten directamente al protagonista.', 2, '1 hora', ['leading-lines', 'composición']),
        ('Contraste de Iluminación para Enfatizar la Historia', 'Usa chiaroscuro o contraluz para crear una sensación de peligro o misterio.', 2, '1.5 horas', ['iluminación', 'chiaroscuro'])
    ],
    18: [
        ('Plano de Planta a Perspectiva (Floor Plan Projection)', 'Dibuja el plano 2D de una habitación y proyéctalo a perspectiva isométrica o cónica.', 1, '2 horas', ['plano', 'proyección']),
        ('Diseño de Props y Mobiliario Funcional', 'Diseña 4 objetos temáticos (escritorio, silla, lámpara, cofre) dentro de un mismo universo.', 4, '1 hora', ['props', 'diseño']),
        ('Escena de Habitación Habitada con Detalles Humanos', 'Dibuja el dormitorio o laboratorio de un personaje con objetos desordenados que revelen su oficio.', 1, '2 horas', ['interior', 'mundo']),
        ('Perspectiva Interior con Techo y Suelo Detallados', 'Dibuja un pasillo gótico o nave industrial con vigas de techo y baldosas en fuga perfecta.', 1, '1.5 horas', ['pasillo', 'arquitectura'])
    ],
    19: [
        ('Giro de Figura Humana en la Mente (360 grados)', 'Dibuja la misma pose rotándola 45 grados sucesivamente sin usar referencia.', 8, '2 horas', ['imaginación', 'rotación']),
        ('Deformación Anatómica en Extensión y Contracción Máxima', 'Dibuja una figura saltando o cayendo con músculos comprimidos y estirados al límite.', 4, '1.5 horas', ['deformación', 'dinamismo']),
        ('Escorzo Extremo de Cuerpo Entero', 'Dibuja una figura donde un puño o un pie se dirija violentamente hacia la pantalla.', 3, '1.5 horas', ['escorzo', 'perspectiva']),
        ('Pose de Lucha Compleja desde la Memoria', 'Dibuja dos figuras interactuando en combate cuerpo a cuerpo creadas puramente desde la mente.', 1, '2 horas', ['combate', 'interacción'])
    ],
    20: [
        ('Megaestructuras y Arquitectura Colosal', 'Diseña un templo o estación espacial gigantesca usando escala humana diminuta para enfatizar tamaño.', 1, '2 horas', ['megaestructura', 'escala']),
        ('Líneas Isométricas vs Cónicas para Edificaciones', 'Compara el dibujo técnico de un edificio en axonométrica y en perspectiva de 2 puntos.', 2, '1.5 horas', ['isometría', 'técnica']),
        ('Diseño de Puentes y Vías Elevadas', 'Dibuja un puente colgante o carretera futurista serpenteando en perspectiva profunda.', 1, '1.5 horas', ['puentes', 'profundidad']),
        ('Detalle Selectivo en Grandes Escalas', 'Aprende a agrupar ventanas y paneles para no saturar la lectura visual.', 2, '1 hora', ['detalle', 'agrupamiento'])
    ],
    21: [
        ('Thumbnails de Entornos: 15 bocetos rápidos de paisaje', 'Explora 15 miniaturas de paisajes naturales y fantásticos buscando grandes masas de valor.', 15, '1 hora', ['thumbnails', 'paisaje']),
        ('Los 3 Planos de Profundidad (Primer plano, medio, fondo)', 'Construye un paisaje donde el primer plano enmarque la vista hacia las montañas lejanas.', 2, '1.5 horas', ['profundidad', 'enmarcado']),
        ('Texturas Naturales: Rocas, follaje, agua y nubes', 'Estudia el render simplificado de formaciones rocosas y masas de hojas de árboles.', 4, '1.5 horas', ['naturaleza', 'texturas']),
        ('Diseño de Entorno Natural Completo', 'Pinta un bosque, cañón o costa marina aplicando todos los principios de composición.', 1, '2 horas', ['entorno', 'paisaje'])
    ],
    22: [
        ('Condición Climática Extrema: Tormenta de nieve o arena', 'Pinta una escena donde el viento y las partículas disuelvan las formas en la lejanía.', 1, '2 horas', ['clima', 'tormenta']),
        ('Iluminación de Hora Dorada y Puesta de Sol', 'Pinta una escena con sombras extralargas, cálidas y doradas contra un cielo crepuscular.', 1, '1.5 horas', ['golden-hour', 'atardecer']),
        ('Entorno Nocturno con Múltiples Fuentes de Luz Artificial', 'Ilustra un callejón mojado con neones, farolas y reflejos en charcos.', 1, '2 horas', ['nocturno', 'neón']),
        ('Diseño de Mundo Temático (Bioma Fantástico)', 'Crea un bioma original (ej. desierto de cristal o jungla bioluminiscente).', 1, '2.5 horas', ['worldbuilding', 'bioma'])
    ],
    23: [
        ('Control de Pinceladas: Ejercicio de 10 esferas de borde', 'Practica transiciones de bordes con pincel duro y pincel suave sin difuminar al azar.', 10, '1 hora', ['bordes', 'pincel']),
        ('Economía de Pinceladas: Retrato en 30 minutos', 'Pinta un rostro intentando usar la menor cantidad de pinceladas posibles sin perder parecido.', 2, '1 hora', ['economía', 'rapidez']),
        ('Paletas Limitadas de Gran Maestro (Zorn Palette)', 'Pinta un estudio usando únicamente blanco, negro, ocre amarillo y rojo cadmio.', 2, '1.5 horas', ['zorn', 'paleta']),
        ('Renderizado de Ojos y Labios con Brillos Especulares', 'Pinta detalles de rostro con reflejos luminosos colocados estratégicamente.', 4, '1 hora', ['detalles', 'rostro'])
    ],
    24: [
        ('Caricatura: Identificación del rasgo distintivo', 'Dibuja 5 celebridades o amigos exagerando su rasgo más característico manteniendo su identidad.', 5, '1.5 horas', ['caricatura', 'exageración']),
        ('Estilización Animada (Estilo Disney / Ghibli / Anime)', 'Dibuja el mismo modelo en 3 estilos de animación completamente distintos.', 3, '1.5 horas', ['estilos', 'animación']),
        ('Diseño de Criatura Antropomórfica', 'Combina anatomía humana con rasgos de animal (ej. hombre lobo, criatura felina) de forma creíble.', 2, '2 horas', ['antropo', 'criatura']),
        ('Expresiones Faciales Extremas y Deformación Cómica', 'Dibuja caras con expresiones exageradas al estilo caricaturesco.', 6, '1 hora', ['expresiones', 'comedia'])
    ],
    25: [
        ('Estudio de Maestro Clásico: Sargent, Rembrandt o Sorolla', 'Copia analítica de una pintura de un gran maestro descomponiendo su paleta y luz.', 2, '3 horas', ['master-study', 'clásico']),
        ('Render de Piel Realista con Zonas de Color Facial', 'Aplica la regla de zonas (frente amarilla, mejillas/nariz roja, barbilla azul/grisácea).', 2, '2 horas', ['piel', 'zonas-faciales']),
        ('Render de Cabello: Masas volumétricas antes que pelos sueltos', 'Pinta cabelleras rizadas y lisas tratándolas como cintas con luz y sombra.', 4, '1.5 horas', ['cabello', 'volumen']),
        ('Pintura Digital de Bodegón con Objetos Metálicos y Fruta', 'Pinta un bodegón del natural o foto prestando atención a reflejos y saturación.', 1, '2 horas', ['bodegón', 'realismo'])
    ],
    26: [
        ('Fotobashing Limpio: Integración de fotos y pintura', 'Combina texturas fotográficas con pintura digital emparejando valores y temperatura de color.', 1, '2 horas', ['photobash', 'técnica']),
        ('Matte Painting: Extensión de Set Cinemático', 'Crea una pintura de fondo cinematográfica a partir de una escena base.', 1, '3 horas', ['matte-painting', 'cine']),
        ('Integración de Humo, Fuego y Efectos Atmosféricos', 'Pinta niebla volumétrica y fuentes de luz emissiva convincentes.', 2, '1.5 horas', ['vfx', 'emissive']),
        ('Pintura Rápida de Concepto (Speedpainting de 45 minutos)', 'Crea una ilustración conceptual completa contrarreloj capturando atmósfera y luz.', 2, '1.5 horas', ['speedpaint', 'concepto'])
    ],
    27: [
        ('Briefing y Moodboard de tu Proyecto Personal', 'Define el concepto, historia, referencias visuales y paleta para tu gran obra maestra.', 1, '2 horas', ['moodboard', 'preparación']),
        ('Fase de Miniaturas y Boceto Definitivo (Thumbnails)', 'Dibuja al menos 6 miniaturas compositivas y selecciona la ganadora para refinar su línea.', 6, '2 horas', ['thumbnails', 'diseño']),
        ('Bloqueo de Color y Valores Tonales (Color Key)', 'Aplica el mapa de valores en escala de grises y luego la clave de color general.', 2, '2 horas', ['color-key', 'bloqueo']),
        ('Pulido Final y Renderizado de Portafolio', 'Dedica sesiones dedicadas a refinar bordes, texturas, iluminación y narrativa.', 1, '5 horas', ['pulido', 'masterpiece'])
    ]
}

def make_checks(unit_idx, term_id, title, challenges):
    checks = []
    defaults = [
        (f'Estudio Práctico de {title}', 'Completa los ejercicios fundamentales descritos en las lecciones recomendadas.', 5, '1 hora', ['práctica', 'fundamentos']),
        (f'Reto Intensivo de {title}', 'Realiza series de repetición para consolidar la memoria muscular.', 10, '1.5 horas', ['reto', 'memoria']),
        (f'Aplicación Creativa Libre', 'Aplica los conceptos aprendidos en un dibujo libre de tu imaginación.', 1, '1 hora', ['creatividad', 'aplicación'])
    ]
    chosen = unit_checks_map.get(unit_idx, defaults)
    for c_i, (c_title, c_desc, c_target, c_dur, c_tags) in enumerate(chosen):
        checks.append({
            'id': f'check_t{term_id}_u{unit_idx}_{c_i+1}',
            'unitId': f'unit_{unit_idx}',
            'termId': term_id,
            'title': c_title,
            'description': c_desc,
            'targetCount': c_target,
            'recommendedDuration': c_dur,
            'tags': c_tags
        })
    return checks

terms = []
total_checks_count = 0

for t_num in range(1, 10):
    t_meta = terms_meta[t_num]
    t_units = []
    start_idx = (t_num - 1) * 3
    for u_i in range(start_idx, start_idx + 3):
        sc_u = scraped[u_i]
        u_idx = u_i + 1
        resources = []
        for c in sc_u.get('courses', []):
            resources.append({
                'title': c['title'],
                'author': 'Curso Especializado',
                'type': 'course',
                'url': c['url'],
                'description': f"Recurso clave para dominar {sc_u['title']}",
                'isFree': 'drawabox' in c['url'].lower()
            })
        for y in sc_u.get('youtube', []):
            resources.append({
                'title': y['title'],
                'author': 'Canal de Arte',
                'type': 'youtube',
                'url': y['url'],
                'description': 'Videotutorial paso a paso con demostración práctica.',
                'isFree': True
            })
        for b in sc_u.get('books', []):
            resources.append({
                'title': b,
                'author': 'Autor Reconocido',
                'type': 'book',
                'url': f"https://www.google.com/search?q={b.replace(' ', '+')}",
                'description': 'Libro clásico de consulta imprescindible.',
                'isFree': False
            })
        challenges = sc_u.get('challenges', [])
        notes = sc_u.get('notes', [])
        desc = notes[0] if notes else f"Estudio en profundidad de {sc_u['title']}."
        desc = desc.replace('Note:', '').strip()
        checks = make_checks(u_idx, t_num, sc_u['title'], challenges)
        total_checks_count += len(checks)
        key_concepts = [
            f"Comprensión teórica y espacial de {sc_u['title']}",
            'Desarrollo de memoria muscular y precisión',
            'Aplicación práctica en dibujos observacionales y de imaginación',
            'Autocrítica y documentación visual del progreso'
        ]
        t_units.append({
            'id': f'unit_{u_idx}',
            'termId': t_num,
            'number': u_idx,
            'title': sc_u['title'],
            'subtitle': challenges[0] if challenges else f'Unidad {u_idx} del currículum',
            'description': desc,
            'keyConcepts': key_concepts,
            'resources': resources,
            'checks': checks
        })
    terms.append({
        'id': t_num,
        'number': t_num,
        'title': t_meta['title'],
        'subtitle': t_meta['subtitle'],
        'estimatedWeeks': t_meta['estimatedWeeks'],
        'description': t_meta['description'],
        'color': t_meta['color'],
        'icon': t_meta['icon'],
        'units': t_units,
        'graduationPrompt': t_meta['gradPrompt']
    })

ts_content = f'''// Autogenerated comprehensive Solo Artist Curriculum Data
import {{ Term }} from '../types/curriculum';

export const CURRICULUM_TERMS: Term[] = {json.dumps(terms, indent=2, ensure_ascii=False)};

export function getTermById(termId: number): Term | undefined {{
  return CURRICULUM_TERMS.find(t => t.id === termId);
}}

export function getUnitById(unitId: string) {{
  for (const term of CURRICULUM_TERMS) {{
    const unit = term.units.find(u => u.id === unitId);
    if (unit) return {{ unit, term }};
  }}
  return undefined;
}}

export function getAllChecks() {{
  const allChecks = [];
  for (const term of CURRICULUM_TERMS) {{
    for (const unit of term.units) {{
      for (const check of unit.checks) {{
        allChecks.push({{ check, unit, term }});
      }}
    }}
  }}
  return allChecks;
}}

export const TOTAL_CHECKS_COUNT = {total_checks_count};
'''

out_path = '/data/data/com.termux/files/home/Art-Street/src/data/curriculumData.ts'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated {out_path} successfully. Total checks: {total_checks_count}")
