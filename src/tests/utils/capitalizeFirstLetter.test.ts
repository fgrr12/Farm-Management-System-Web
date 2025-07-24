import { describe, expect, it } from 'vitest'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

describe('capitalizeFirstLetter', () => {
	describe('basic functionality', () => {
		it('should capitalize the first letter of a string', () => {
			expect(capitalizeFirstLetter('hello')).toBe('Hello')
			expect(capitalizeFirstLetter('world')).toBe('World')
			expect(capitalizeFirstLetter('javascript')).toBe('Javascript')
		})

		it('should handle already capitalized strings', () => {
			expect(capitalizeFirstLetter('Hello')).toBe('Hello')
			expect(capitalizeFirstLetter('WORLD')).toBe('WORLD')
			expect(capitalizeFirstLetter('JavaScript')).toBe('JavaScript')
		})

		it('should handle single character strings', () => {
			expect(capitalizeFirstLetter('a')).toBe('A')
			expect(capitalizeFirstLetter('z')).toBe('Z')
			expect(capitalizeFirstLetter('1')).toBe('1')
			expect(capitalizeFirstLetter('!')).toBe('!')
		})
	})

	describe('edge cases', () => {
		it('should handle empty string', () => {
			expect(capitalizeFirstLetter('')).toBe('')
		})

		it('should handle strings with spaces', () => {
			expect(capitalizeFirstLetter('hello world')).toBe('Hello world')
			expect(capitalizeFirstLetter(' hello')).toBe(' hello') // Leading space
			expect(capitalizeFirstLetter('hello ')).toBe('Hello ')
			expect(capitalizeFirstLetter('  multiple  spaces  ')).toBe('  multiple  spaces  ')
		})

		it('should handle strings with special characters', () => {
			expect(capitalizeFirstLetter('!hello')).toBe('!hello')
			expect(capitalizeFirstLetter('123abc')).toBe('123abc')
			expect(capitalizeFirstLetter('@test')).toBe('@test')
			expect(capitalizeFirstLetter('#hashtag')).toBe('#hashtag')
			expect(capitalizeFirstLetter('$money')).toBe('$money')
			expect(capitalizeFirstLetter('%percent')).toBe('%percent')
		})

		it('should handle strings with only whitespace', () => {
			expect(capitalizeFirstLetter('   ')).toBe('   ')
			expect(capitalizeFirstLetter('\t')).toBe('\t')
			expect(capitalizeFirstLetter('\n')).toBe('\n')
			expect(capitalizeFirstLetter('\r')).toBe('\r')
			expect(capitalizeFirstLetter('\t\n\r ')).toBe('\t\n\r ')
		})
	})

	describe('non-string inputs', () => {
		it('should handle numbers by returning them as-is', () => {
			expect(capitalizeFirstLetter(123)).toBe(123)
			expect(capitalizeFirstLetter(0)).toBe(0)
			expect(capitalizeFirstLetter(-456)).toBe(-456)
			expect(capitalizeFirstLetter(3.14)).toBe(3.14)
			expect(capitalizeFirstLetter(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
			expect(capitalizeFirstLetter(Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY)
			expect(capitalizeFirstLetter(Number.NaN)).toBe(Number.NaN)
		})

		it('should handle non-string, non-number inputs', () => {
			expect(capitalizeFirstLetter(null as any)).toBe(null)
			expect(capitalizeFirstLetter(undefined as any)).toBe(undefined)
			expect(capitalizeFirstLetter(true as any)).toBe(true)
			expect(capitalizeFirstLetter(false as any)).toBe(false)
			expect(capitalizeFirstLetter([] as any)).toEqual([])
			expect(capitalizeFirstLetter({} as any)).toEqual({})
			expect(capitalizeFirstLetter(new Date() as any)).toBeInstanceOf(Date)
		})
	})

	describe('international characters', () => {
		it('should handle strings with accented characters', () => {
			expect(capitalizeFirstLetter('áéíóú')).toBe('Áéíóú')
			expect(capitalizeFirstLetter('ñoño')).toBe('Ñoño')
			expect(capitalizeFirstLetter('café')).toBe('Café')
			expect(capitalizeFirstLetter('résumé')).toBe('Résumé')
			expect(capitalizeFirstLetter('naïve')).toBe('Naïve')
		})

		it('should handle strings with non-Latin characters', () => {
			expect(capitalizeFirstLetter('москва')).toBe('Москва') // Russian
			expect(capitalizeFirstLetter('北京')).toBe('北京') // Chinese
			expect(capitalizeFirstLetter('東京')).toBe('東京') // Japanese
			expect(capitalizeFirstLetter('서울')).toBe('서울') // Korean
			expect(capitalizeFirstLetter('αθήνα')).toBe('Αθήνα') // Greek
		})

		it('should handle strings with emojis', () => {
			expect(capitalizeFirstLetter('😀hello')).toBe('😀hello')
			expect(capitalizeFirstLetter('🎉party')).toBe('🎉party')
			expect(capitalizeFirstLetter('hello 👋')).toBe('Hello 👋')
		})
	})

	describe('mixed case strings', () => {
		it('should handle mixed case strings', () => {
			expect(capitalizeFirstLetter('hELLO')).toBe('HELLO')
			expect(capitalizeFirstLetter('wOrLd')).toBe('WOrLd')
			expect(capitalizeFirstLetter('tEsT cAsE')).toBe('TEsT cAsE')
			expect(capitalizeFirstLetter('jAvAsCrIpT')).toBe('JAvAsCrIpT')
		})

		it('should handle camelCase strings', () => {
			expect(capitalizeFirstLetter('camelCase')).toBe('CamelCase')
			expect(capitalizeFirstLetter('firstName')).toBe('FirstName')
			expect(capitalizeFirstLetter('getElementById')).toBe('GetElementById')
		})

		it('should handle PascalCase strings', () => {
			expect(capitalizeFirstLetter('PascalCase')).toBe('PascalCase')
			expect(capitalizeFirstLetter('FirstName')).toBe('FirstName')
			expect(capitalizeFirstLetter('GetElementById')).toBe('GetElementById')
		})
	})

	describe('strings starting with numbers', () => {
		it('should handle strings starting with numbers', () => {
			expect(capitalizeFirstLetter('123hello')).toBe('123hello')
			expect(capitalizeFirstLetter('1st place')).toBe('1st place')
			expect(capitalizeFirstLetter('2024 year')).toBe('2024 year')
			expect(capitalizeFirstLetter('42 answer')).toBe('42 answer')
		})

		it('should handle strings with numbers and letters mixed', () => {
			expect(capitalizeFirstLetter('a1b2c3')).toBe('A1b2c3')
			expect(capitalizeFirstLetter('test123')).toBe('Test123')
			expect(capitalizeFirstLetter('version2.0')).toBe('Version2.0')
		})
	})

	describe('performance and edge cases', () => {
		it('should handle very long strings', () => {
			const longString = 'a'.repeat(10000)
			const result = capitalizeFirstLetter(longString) as string
			expect(result[0]).toBe('A')
			expect(result.length).toBe(10000)
			expect(result.slice(1)).toBe('a'.repeat(9999))
		})

		it('should handle strings with unusual Unicode characters', () => {
			expect(capitalizeFirstLetter('\u0000hello')).toBe('\u0000hello') // Null character
			expect(capitalizeFirstLetter('\u200Bhello')).toBe('\u200Bhello') // Zero-width space
			expect(capitalizeFirstLetter('\uFEFFhello')).toBe('\uFEFFhello') // Byte order mark
		})

		it('should be consistent with multiple calls', () => {
			const testString = 'consistency test'
			const result1 = capitalizeFirstLetter(testString)
			const result2 = capitalizeFirstLetter(testString)
			const result3 = capitalizeFirstLetter(testString)

			expect(result1).toBe(result2)
			expect(result2).toBe(result3)
			expect(result1).toBe('Consistency test')
		})
	})

	describe('real-world use cases', () => {
		it('should handle common names', () => {
			expect(capitalizeFirstLetter('john')).toBe('John')
			expect(capitalizeFirstLetter('maría')).toBe('María')
			expect(capitalizeFirstLetter('josé')).toBe('José')
			expect(capitalizeFirstLetter("o'connor")).toBe("O'connor")
			expect(capitalizeFirstLetter('van der berg')).toBe('Van der berg')
		})

		it('should handle common words', () => {
			expect(capitalizeFirstLetter('hello')).toBe('Hello')
			expect(capitalizeFirstLetter('goodbye')).toBe('Goodbye')
			expect(capitalizeFirstLetter('please')).toBe('Please')
			expect(capitalizeFirstLetter('thank you')).toBe('Thank you')
		})

		it('should handle technical terms', () => {
			expect(capitalizeFirstLetter('javascript')).toBe('Javascript')
			expect(capitalizeFirstLetter('typescript')).toBe('Typescript')
			expect(capitalizeFirstLetter('react')).toBe('React')
			expect(capitalizeFirstLetter('node.js')).toBe('Node.js')
			expect(capitalizeFirstLetter('api')).toBe('Api')
		})
	})
})
