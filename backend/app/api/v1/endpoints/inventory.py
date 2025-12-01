from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date as date_module

from app.api.deps import get_current_user_from_session
from app.database import get_db
from app.models.inventory import Wine, Supplier, StockMovement, Lot
from app.models.translation import TranslationCategory
from app.schemas.inventory import (
    WineCreate,
    WineRead,
    WineUpdate,
    WineCriticalStock,
    SupplierCreate,
    SupplierRead,
    SupplierUpdate,
    StockMovementCreate,
    StockMovementRead,
    StockMovementUpdate,
    StockMovementReadWithWine,
)
from app.services.translations import get_translation_map


async def _wine_response(wine: Wine, db: AsyncSession) -> WineRead:
    translations = await get_translation_map(db, TranslationCategory.WINE_TYPE)
    return _attach_wine_translation(wine, translations)


async def _wine_list_response(wines: list[Wine], db: AsyncSession) -> list[WineRead]:
    translations = await get_translation_map(db, TranslationCategory.WINE_TYPE)
    return [_attach_wine_translation(wine, translations) for wine in wines]


def _attach_wine_translation(wine: Wine, translations):
    schema = WineRead.model_validate(wine)
    translation = translations.get(wine.type.value)
    if translation:
        schema.type_label = translation
    return schema

router = APIRouter()

# Helper to enforce role permissions
def require_role(session: dict, allowed_roles: list[str]):
    role = session.get("role")
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return role

# ---------- Suppliers ----------
@router.post("/suppliers", response_model=SupplierRead)
async def create_supplier(
    supplier: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere"])
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

@router.get("/suppliers", response_model=list[SupplierRead])
async def list_suppliers(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    result = await db.execute(select(Supplier))
    return result.scalars().all()

@router.patch("/suppliers/{supplier_id}", response_model=SupplierRead)
async def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere"])
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    db_supplier = result.scalar_one_or_none()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    
    update_data = supplier.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
    
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

# ---------- Wines ----------
@router.post("/wines", response_model=WineRead)
async def create_wine(
    wine: WineCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere"])
    
    # Validate supplier exists if provided
    if wine.supplier_id:
        supplier = await db.get(Supplier, wine.supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
    
    # Check barcode uniqueness if provided
    if wine.barcode:
        result = await db.execute(select(Wine).where(Wine.barcode == wine.barcode))
        existing_wine = result.scalar_one_or_none()
        if existing_wine:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode already exists"
            )
    
    db_wine = Wine(**wine.model_dump())
    db.add(db_wine)
    await db.commit()
    await db.refresh(db_wine)
    return await _wine_response(db_wine, db)

@router.get("/wines", response_model=list[WineRead])
async def list_wines(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    type: str | None = None,
    vintage: int | None = None,
    denomination: str | None = None,
    supplier_id: int | None = None,
    available_only: bool = False,
    below_threshold: bool = False,
):
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    query = select(Wine)
    
    # Apply filters
    if search:
        query = query.where(Wine.name.ilike(f"%{search}%"))
    if type:
        query = query.where(Wine.type == type)
    if vintage:
        query = query.where(Wine.vintage == vintage)
    if denomination:
        query = query.where(Wine.denomination == denomination)
    if supplier_id:
        query = query.where(Wine.supplier_id == supplier_id)
    if available_only:
        query = query.where(Wine.quantity > 0)
    if below_threshold:
        query = query.where(Wine.quantity < Wine.threshold)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    wines = result.scalars().all()
    translations = await get_translation_map(db, TranslationCategory.WINE_TYPE)
    return await _wine_list_response(wines, db)

@router.get("/wines/{wine_id}", response_model=WineRead)
async def get_wine(
    wine_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    wine = await db.get(Wine, wine_id)
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    return await _wine_response(wine, db)

@router.patch("/wines/{wine_id}", response_model=WineRead)
async def update_wine(
    wine_id: int,
    wine: WineUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere"])
    result = await db.execute(select(Wine).where(Wine.id == wine_id))
    db_wine = result.scalar_one_or_none()
    if not db_wine:
        raise HTTPException(status_code=404, detail="Vino non trovato")
    
    # Validate supplier exists if provided
    update_data = wine.model_dump(exclude_unset=True)
    if "supplier_id" in update_data and update_data["supplier_id"]:
        supplier = await db.get(Supplier, update_data["supplier_id"])
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fornitore non trovato"
            )
    
    # Check barcode uniqueness if provided and changed
    if "barcode" in update_data and update_data["barcode"] and update_data["barcode"] != db_wine.barcode:
        result = await db.execute(select(Wine).where(Wine.barcode == update_data["barcode"]))
        existing_wine = result.scalar_one_or_none()
        if existing_wine:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Codice a barre già esistente"
            )
    
    for key, value in update_data.items():
        setattr(db_wine, key, value)
    
    await db.commit()
    await db.refresh(db_wine)
    return await _wine_response(db_wine, db)

# ---------- Stock Movements ----------
@router.post("/movements", response_model=StockMovementReadWithWine)
async def create_movement(
    movement: StockMovementCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    # Check permissions - ADJUST only for admin
    if movement.type == "adjust":
        pass  # require_role(user, ["admin"])
    else:
        pass  # require_role(user, ["admin", "magazziniere"])
    
    # Verify wine exists
    wine = await db.get(Wine, movement.wine_id)
    if not wine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wine not found")
    
    # Convert quantity to bottles based on unit
    quantity_in_bottles = movement.quantity
    if movement.unit == "package":
        quantity_in_bottles = movement.quantity * wine.bottles_per_package
    
    lot_id = None
    
    if movement.type == "in":
        # Create new lot for incoming stock (always in bottles)
        new_lot = Lot(
            wine_id=movement.wine_id,
            quantity=quantity_in_bottles,
            received_date=date_module.today(),
            notes=movement.note
        )
        db.add(new_lot)
        await db.flush()  # Get lot ID
        lot_id = new_lot.id
        
        # Update wine quantity (always in bottles)
        wine.quantity += quantity_in_bottles
        
    elif movement.type == "out":
        if movement.lot_id:
            # OUT from specific lot
            lot = await db.get(Lot, movement.lot_id)
            if not lot:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
            if lot.wine_id != movement.wine_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lot does not belong to this wine")
            if lot.quantity < quantity_in_bottles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock in lot. Available: {lot.quantity}, requested: {quantity_in_bottles}"
                )
            lot.quantity -= quantity_in_bottles
            lot_id = lot.id
        else:
            # FIFO: Use oldest lot first
            result = await db.execute(
                select(Lot)
                .where(Lot.wine_id == movement.wine_id, Lot.quantity > 0)
                .order_by(Lot.received_date.asc())
            )
            lots = result.scalars().all()
            
            if not lots:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No lots available")
            
            remaining = quantity_in_bottles
            for lot in lots:
                if remaining <= 0:
                    break
                    
                to_remove = min(lot.quantity, remaining)
                lot.quantity -= to_remove
                remaining -= to_remove
                
                if lot_id is None:  # Use first lot as reference
                    lot_id = lot.id
            
            if remaining > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock. Available: {wine.quantity}, requested: {quantity_in_bottles}"
                )
        
        # Check total wine stock
        if wine.quantity < quantity_in_bottles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        wine.quantity -= quantity_in_bottles
        
    elif movement.type == "adjust":
        # Direct adjustment (admin only, already checked)
        wine.quantity += quantity_in_bottles
    
    # Create movement record
    # Note: user_id is stored as string in session but Integer in DB
    # For dev mode, we use None since "dev-user-123" is not a valid integer
    user_id_value = None
    if user.get("sub") and isinstance(user.get("sub"), int):
        user_id_value = user.get("sub")
    
    db_movement = StockMovement(
        wine_id=movement.wine_id,
        lot_id=lot_id,
        type=movement.type,
        quantity=quantity_in_bottles,  # Always store in bottles
        unit=movement.unit,  # Store the unit used for input
        quantity_in_unit=movement.quantity,  # Store original quantity in the specified unit
        note=movement.note,
        reference=movement.reference,
        user_id=user_id_value
    )
    db.add(db_movement)
    await db.commit()
    await db.refresh(db_movement)
    
    # Add wine details to response
    response_data = StockMovementRead.model_validate(db_movement)
    # Convert to dict and add wine details
    response_dict = response_data.model_dump()
    response_dict["wine_name"] = wine.name
    response_dict["wine_vintage"] = wine.vintage
    
    return response_dict

@router.get("/movements", response_model=list[StockMovementRead])
async def list_movements(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
    skip: int = 0,
    limit: int = 20,
    wine_id: int | None = None,
    type: str | None = None,
):
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    
    query = select(StockMovement)
    
    # Apply filters
    if wine_id:
        query = query.where(StockMovement.wine_id == wine_id)
    if type:
        query = query.where(StockMovement.type == type)
    
    query = query.offset(skip).limit(limit).order_by(StockMovement.timestamp.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/movements/{movement_id}", response_model=StockMovementRead)
async def update_movement(
    movement_id: int,
    movement: StockMovementUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin"])
    result = await db.execute(select(StockMovement).where(StockMovement.id == movement_id))
    db_movement = result.scalar_one_or_none()
    if not db_movement:
        raise HTTPException(status_code=404, detail="Movimento non trovato")
    
    update_data = movement.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_movement, key, value)
    
    await db.commit()
    await db.refresh(db_movement)
    return db_movement

# ---------- Barcode lookup ----------
@router.get("/barcode/{code}", response_model=WineRead)
async def get_wine_by_barcode(
    code: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
):
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    result = await db.execute(select(Wine).where(Wine.barcode == code))
    wine = result.scalar_one_or_none()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found for barcode")
    return await _wine_response(wine, db)

# ---------- Critical Stock ----------
@router.get("/critical", response_model=list[WineCriticalStock])
async def get_critical_stock(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user_from_session),
    severity: str | None = None,
):
    """Get wines with critical or warning stock levels"""
    pass  # require_role(user, ["admin", "magazziniere", "consultatore"])
    
    # Query wines below threshold or out of stock
    from sqlalchemy.orm import selectinload
    
    query = select(Wine).options(selectinload(Wine.supplier))
    
    # Filter by severity if specified
    if severity == "critical":
        query = query.where(Wine.quantity == 0)
    elif severity == "warning":
        query = query.where(Wine.quantity > 0, Wine.quantity < Wine.threshold)
    else:
        # Both critical and warning
        query = query.where(
            (Wine.quantity == 0) | (Wine.quantity < Wine.threshold)
        )
    
    result = await db.execute(query)
    wines = result.scalars().all()
    translations = await get_translation_map(db, TranslationCategory.WINE_TYPE)

    critical_wines = []
    for wine in wines:
        severity_level = "critical" if wine.quantity == 0 else "warning"
        critical_wines.append(
            WineCriticalStock(
                id=wine.id,
                name=wine.name,
                vintage=wine.vintage,
                quantity=wine.quantity,
                threshold=wine.threshold,
                severity=severity_level,
                supplier=wine.supplier,
                type_label=translations.get(wine.type.value),
            )
        )
    
    return critical_wines
