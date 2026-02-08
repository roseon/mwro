import type { ConditionTemplateCallback } from '../ConditionTemplateExecutable';

export const isValidNumber: ConditionTemplateCallback = ({ player }, params) => {
	const text = params?.text as string;
	if (!text) return false;

	const num = Number(text);
	return !isNaN(num) && Number.isInteger(num) && num > 0;
};
