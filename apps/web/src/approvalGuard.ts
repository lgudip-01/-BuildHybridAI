// Use the same engine module singleton as mask() and approve().
// A missing engine is a build error, never permission to send.
export { assertApproved } from '@clause-guard/privacy-engine/approval';
