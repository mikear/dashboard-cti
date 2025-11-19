#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test simple de traducción con deep-translator"""

try:
    from deep_translator import GoogleTranslator
    
    print("✅ Librería deep-translator importada correctamente")
    
    translator = GoogleTranslator(source='auto', target='es')
    print("✅ Traductor creado (auto -> es)")
    
    # Test 1: Frase simple
    test1 = "Hello World"
    result1 = translator.translate(test1)
    print(f"\nTest 1:")
    print(f"  Original: {test1}")
    print(f"  Traducido: {result1}")
    
    # Test 2: Texto técnico (común en feeds de seguridad)
    test2 = "Critical Security Vulnerability Found in Apache Server"
    result2 = translator.translate(test2)
    print(f"\nTest 2:")
    print(f"  Original: {test2}")
    print(f"  Traducido: {result2}")
    
    # Test 3: Texto más largo
    test3 = "Researchers have discovered a new ransomware campaign targeting healthcare organizations worldwide"
    result3 = translator.translate(test3)
    print(f"\nTest 3:")
    print(f"  Original: {test3}")
    print(f"  Traducido: {result3}")
    
    print("\n✅ Todas las traducciones funcionaron correctamente")
    
except ImportError as e:
    print(f"❌ Error al importar deep-translator: {e}")
    print("Instala con: pip install deep-translator")
    
except Exception as e:
    print(f"❌ Error durante la traducción: {e}")
    print(f"Tipo de error: {type(e).__name__}")
