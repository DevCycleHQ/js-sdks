import {
    ErrorCode,
    EvaluationContext,
    FlagValue,
    StandardResolutionReasons,
} from '@openfeature/server-sdk'

import {
    FirstMatchStrategy,
    StrategyPerProviderContext,
    ProviderResolutionResult,
} from '@openfeature/multi-provider'

/**
 * Extends FirstMatchStrategy to handle the DevCycle Provider, which returns DEFAULT for the "flag not found" case.
 * Return the first result that did not return a default value or indicate "flag not found".
 *
 * Note: To use this strategy with DevCycle features, ensure all targeting rules include an "All Users" rule
 * to avoid returning DEFAULT for known keys.
 */
export class DevCycleMigrationStrategy extends FirstMatchStrategy {
    override shouldEvaluateNextProvider<T extends FlagValue>(
        strategyContext: StrategyPerProviderContext,
        context: EvaluationContext,
        result: ProviderResolutionResult<T>,
    ): boolean {
        if (
            this.hasErrorWithCode(result, ErrorCode.FLAG_NOT_FOUND) ||
            ('details' in result &&
                result.details.reason === StandardResolutionReasons.DEFAULT)
        ) {
            return true
        }
        return false
    }
}
