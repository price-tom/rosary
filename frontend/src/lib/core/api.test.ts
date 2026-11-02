import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from './api'

vi.mock('./platform', () => ({
	backendOrigin: () => 'http://api.test'
}))

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const fetchMock = vi.mocked(fetch)
const sentHeaders = (call = 0) => fetchMock.mock.calls[call][1]!.headers as Headers

describe('api', () => {
	beforeEach(() => {
		fetchMock.mockReset()
	})

	it('unwraps a data envelope', async () => {
		fetchMock.mockResolvedValue(json({ data: { id: 1 } }))
		expect(await api.get('/x')).toEqual({ id: 1 })
	})

	it('returns null for 204', async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
		expect(await api.get('/x')).toBeNull()
	})

	it('throws ApiError with the server message and status', async () => {
		fetchMock.mockResolvedValue(json({ message: 'nope' }, 422))
		const error = await api.get('/x').catch((e) => e)
		expect(error).toBeInstanceOf(ApiError)
		expect(error).toMatchObject({ message: 'nope', status: 422 })
	})

	it('sends cookies and no bearer token', async () => {
		fetchMock.mockResolvedValue(json({}))
		await api.get('/x')
		expect(fetchMock.mock.calls[0][1]!.credentials).toBe('include')
		expect(sentHeaders().has('Authorization')).toBe(false)
	})

	it('sends the XSRF token on unsafe requests', async () => {
		fetchMock.mockImplementation(async () => new Response(null, { status: 204 }))
		await api.post('/x', {})
		const post = fetchMock.mock.calls.at(-1)![1]!
		expect((post.headers as Headers).get('X-XSRF-TOKEN')).toBe('test-token')
	})

	it('refreshes the CSRF cookie and retries once after a 419', async () => {
		fetchMock
			.mockResolvedValueOnce(json({}, 419))
			.mockResolvedValueOnce(new Response(null, { status: 204 }))
			.mockResolvedValueOnce(json({ ok: true }))
		expect(await api.get('/x')).toEqual({ ok: true })
		expect(String(fetchMock.mock.calls[1][0])).toContain('/sanctum/csrf-cookie')
	})
})
