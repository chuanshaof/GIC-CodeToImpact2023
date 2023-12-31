from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, and_, desc
from sqlalchemy.orm import Session
import logging
from models import Positions, Pricing, Funds
from database import get_db

router = APIRouter()

# Covers the "positions" component

router = APIRouter(
    prefix="/funds",
    tags=["funds"],
    responses={404: {"description": "Not found"}},
)


@router.post("/{fund_id}/refresh")
def refresh_fund(fund_id: int, db: Session = Depends(get_db)):
    # Query for the latest positions for each instrument, filtered by fundId
    subq = (
        select(
            func.max(Positions.reportedDate).label("maxdate"),
            Positions.instrumentId,
            Positions.fundId,
        )
        .group_by(Positions.instrumentId)
        .filter(Positions.fundId == fund_id)
    )
    subq = subq.subquery()
    query = (
        select(
            Positions,
        )
        .select_from(Positions)
        .join(
            subq,
            and_(
                Positions.instrumentId == subq.c.instrumentId,
                subq.c.maxdate == Positions.reportedDate,
                subq.c.fundId == Positions.fundId,
            ),
        )
    )
    positions = db.execute(query).all()

    for position in positions:
        position = position[0]
        latestPrice = (
            db.query(Pricing)
            .filter(Pricing.instrumentId == position.instrumentId)
            .order_by(desc(Pricing.reportedDate))
            .first()
        )

        if latestPrice.reportedDate == position.reportedDate:
            position.marketValue = position.quantity * latestPrice.unitPrice
        else:
            updatedPosition = Positions(
                fundId=position.fundId,
                instrumentId=position.instrumentId,
                quantity=position.quantity,
                marketValue=position.quantity * latestPrice.unitPrice,
                realisedProfitLoss=position.realisedProfitLoss,
                reportedDate=latestPrice.reportedDate,
            )

            db.add(updatedPosition)
            db.commit()
            logging.info(f"Updated position {position.positionId}")


@router.get("/{fund_id}/instruments/{instrument_id}")
def get_instrument_fund_position(
    fund_id: int, instrument_id: int, db: Session = Depends(get_db)
):
    portfolio = (
        db.query(Positions)
        .filter(Positions.instrumentId == instrument_id)
        .filter(Positions.fundId == fund_id)
        .all()
    )

    if portfolio:
        return portfolio
    else:
        logging.error(f"Instrument {instrument_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instrument-Fund pair not found",
        )


@router.get("")
def get_positions(db: Session = Depends(get_db)):
    funds = db.query(Positions, Funds).filter(Funds.fundId == Positions.fundId).all()

    if funds:
        # Create a list to store merged data
        merged_data = []

        for row in funds:
            position, fund = row
            position.fundName = fund.fundName
            merged_data.append(position)

        # Return the merged data as JSON
        return merged_data
    else:
        logging.error("No funds found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No funds found"
        )
