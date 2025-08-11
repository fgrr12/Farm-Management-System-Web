import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TasksService } from './index'

// Mock callableFireFunction
vi.mock('@/utils/callableFireFunction', () => ({
	callableFireFunction: vi.fn(),
}))

import { callableFireFunction } from '@/utils/callableFireFunction'

describe('TasksService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getTasks', () => {
		it('should return all tasks when no filters applied', async () => {
			const mockTasks = [
				{
					uuid: '1',
					title: 'Feed animals',
					status: 'todo',
					priority: 'high',
					farmUuid: 'farm-1',
					speciesUuid: 'species-1',
					createdAt: '2024-01-01',
				},
				{
					uuid: '2',
					title: 'Clean barn',
					status: 'in-progress',
					priority: 'medium',
					farmUuid: 'farm-1',
					speciesUuid: 'species-2',
					createdAt: '2024-01-02',
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockTasks.map((task) => ({
					data: () => task,
				})),
			} as any)

			const result = await TasksService.getTasks({
				farmUuid: 'farm-1',
				search: '',
				status: '',
				priority: '',
				speciesUuid: '',
			})

			expect(result).toHaveLength(2)
			expect(result[0].priority).toBe('high')
			expect(result[1].priority).toBe('medium')
		})

		it('should filter tasks by status', async () => {
			const mockTasks = [
				{
					uuid: '1',
					title: 'Feed animals',
					status: 'todo',
					priority: 'high',
					farmUuid: 'farm-1',
					createdAt: '2024-01-01',
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockTasks.map((task) => ({
					data: () => task,
				})),
			} as any)

			const result = await TasksService.getTasks({
				farmUuid: 'farm-1',
				search: '',
				status: 'todo',
				priority: '',
				speciesUuid: '',
			})

			expect(result).toHaveLength(1)
			expect(result[0].status).toBe('todo')
		})

		it('should filter tasks by search term', async () => {
			const mockTasks = [
				{
					uuid: '1',
					title: 'Feed animals',
					status: 'todo',
					priority: 'high',
					farmUuid: 'farm-1',
					createdAt: '2024-01-01',
				},
				{
					uuid: '2',
					title: 'Clean barn',
					status: 'todo',
					priority: 'medium',
					farmUuid: 'farm-1',
					createdAt: '2024-01-02',
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockTasks.map((task) => ({
					data: () => task,
				})),
			} as any)

			const result = await TasksService.getTasks({
				farmUuid: 'farm-1',
				search: 'feed',
				status: '',
				priority: '',
				speciesUuid: '',
			})

			expect(result).toHaveLength(1)
			expect(result[0].title).toBe('Feed animals')
		})

		it('should sort tasks by priority and creation date', async () => {
			const mockTasks = [
				{
					uuid: '1',
					title: 'Low priority task',
					status: 'todo',
					priority: 'low',
					farmUuid: 'farm-1',
					createdAt: '2024-01-03',
				},
				{
					uuid: '2',
					title: 'High priority task',
					status: 'todo',
					priority: 'high',
					farmUuid: 'farm-1',
					createdAt: '2024-01-01',
				},
				{
					uuid: '3',
					title: 'Medium priority task',
					status: 'todo',
					priority: 'medium',
					farmUuid: 'farm-1',
					createdAt: '2024-01-02',
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockTasks.map((task) => ({
					data: () => task,
				})),
			} as any)

			const result = await TasksService.getTasks({
				farmUuid: 'farm-1',
				search: '',
				status: '',
				priority: '',
				speciesUuid: '',
			})

			expect(result[0].priority).toBe('high')
			expect(result[1].priority).toBe('medium')
			expect(result[2].priority).toBe('low')
		})
	})

	describe('setTask', () => {
		it('should create a new task', async () => {
			const mockTask = {
				uuid: '1',
				title: 'Feed animals',
				description: 'Feed all cattle',
				status: 'todo',
				priority: 'high',
				dueDate: '2024-01-01',
				speciesUuid: 'species-1',
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await TasksService.setTask(mockTask as any, 'user-1', 'farm-1')

			expect(setDoc).toHaveBeenCalled()
		})
	})

	describe('updateTaskStatus', () => {
		it('should update task status', async () => {
			// Mock getTasks to return a task
			vi.mocked(callableFireFunction)
				.mockResolvedValueOnce({
					data: [{ uuid: 'task-1', title: 'Test Task', status: 'todo', farmUuid: 'farm-1' }],
				})
				.mockResolvedValueOnce({
					data: { uuid: 'task-1', isNew: false },
				})

			await TasksService.updateTaskStatus('task-1', 'done', 'user-1', 'farm-1')

			expect(callableFireFunction).toHaveBeenCalledTimes(2)
		})
	})
})
