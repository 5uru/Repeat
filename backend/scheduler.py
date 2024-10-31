from datetime import datetime, timedelta
import math

class Scheduler:
    """
    Implements the SuperMemo 2 algorithm for spaced repetition
    """

    @staticmethod
    def calculate_next_review(card, quality: int) -> tuple[datetime, float, int]:
        """
        Calculate the next review date based on the quality of response
        quality: 0-5 where:
        0 = Complete blackout
        5 = Perfect response
        """
        if quality < 3:
            card.interval = 0
            card.ease_factor = max(1.3, card.ease_factor - 0.2)
        else:
            if card.interval == 0:
                card.interval = 1
            elif card.interval == 1:
                card.interval = 6
            else:
                card.interval *= card.ease_factor

            card.ease_factor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)

        # Calculate next review date
        if card.interval == 0:
            next_review = datetime.now()  # Review again today
        else:
            next_review = datetime.now() + timedelta(days=card.interval)

        return next_review, card.ease_factor, math.ceil(card.interval)