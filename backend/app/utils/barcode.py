"""
Barcode validation and generation utilities.

Supports EAN-13, Code128, Internal, and QR barcode formats.
Requirements: 9.1, 8.3
"""

import re
from typing import Optional


def validate_ean13(barcode: str) -> bool:
    """
    Validate EAN-13 barcode format with checksum.
    
    EAN-13 format: 13 digits with valid checksum
    
    Args:
        barcode: The barcode string to validate
        
    Returns:
        True if valid EAN-13, False otherwise
        
    Requirements: 9.1
    """
    # Must be exactly 13 digits
    if not re.match(r'^[0-9]{13}$', barcode):
        return False
    
    # Validate checksum
    digits = [int(d) for d in barcode]
    
    # Calculate checksum: sum of odd positions * 1 + even positions * 3
    checksum = 0
    for i in range(12):
        if i % 2 == 0:
            checksum += digits[i]
        else:
            checksum += digits[i] * 3
    
    # Check digit should make total divisible by 10
    check_digit = (10 - (checksum % 10)) % 10
    
    return digits[12] == check_digit


def validate_code128(barcode: str) -> bool:
    """
    Validate Code128 barcode format.
    
    Code128 format: 1-20 alphanumeric characters, hyphens, dots, and spaces
    
    Args:
        barcode: The barcode string to validate
        
    Returns:
        True if valid Code128, False otherwise
        
    Requirements: 9.1
    """
    # Must be 1-20 characters
    if not (1 <= len(barcode) <= 20):
        return False
    
    # Must contain only alphanumeric, hyphens, dots, and spaces
    if not re.match(r'^[A-Za-z0-9\-\.\s]+$', barcode):
        return False
    
    return True


def validate_internal_barcode(barcode: str) -> bool:
    """
    Validate internal barcode format.
    
    Internal format: INT followed by 10 digits (total 13 characters)
    Example: INT0000000123
    
    Args:
        barcode: The barcode string to validate
        
    Returns:
        True if valid internal barcode, False otherwise
        
    Requirements: 9.1, 8.3
    """
    # Must match INT followed by exactly 10 digits
    if not re.match(r'^INT[0-9]{10}$', barcode):
        return False
    
    return True


def validate_qr_barcode(barcode: str) -> bool:
    """
    Validate QR barcode format.
    
    QR format: Any alphanumeric string up to 20 characters
    
    Args:
        barcode: The barcode string to validate
        
    Returns:
        True if valid QR barcode, False otherwise
        
    Requirements: 9.1
    """
    # Must be 1-20 characters
    if not (1 <= len(barcode) <= 20):
        return False
    
    # Must contain only alphanumeric characters
    if not barcode.isalnum():
        return False
    
    return True


def validate_barcode(barcode: str, barcode_type: Optional[str] = None) -> bool:
    """
    Validate barcode against specified type or try all formats.
    
    Args:
        barcode: The barcode string to validate
        barcode_type: Optional barcode type (EAN13, CODE128, INTERNAL, QR)
                     If None, tries all formats
        
    Returns:
        True if barcode is valid for the specified type or any type
        
    Requirements: 9.1
    """
    if not barcode or not isinstance(barcode, str):
        return False
    
    # Strip whitespace
    barcode = barcode.strip()
    
    if not barcode:
        return False
    
    # If type is specified, validate against that type only
    if barcode_type:
        barcode_type = barcode_type.upper()
        
        if barcode_type == "EAN13":
            return validate_ean13(barcode)
        elif barcode_type == "CODE128":
            return validate_code128(barcode)
        elif barcode_type == "INTERNAL":
            return validate_internal_barcode(barcode)
        elif barcode_type == "QR":
            return validate_qr_barcode(barcode)
        else:
            return False
    
    # Try all formats if no type specified
    return (
        validate_ean13(barcode) or
        validate_code128(barcode) or
        validate_internal_barcode(barcode) or
        validate_qr_barcode(barcode)
    )


def generate_internal_barcode(wine_id: int) -> str:
    """
    Generate internal barcode for a wine.
    
    Format: INT{wine_id} padded to 13 characters total
    Example: wine_id=123 -> INT0000000123
    
    Args:
        wine_id: The wine ID to generate barcode for
        
    Returns:
        Internal barcode string (13 characters)
        
    Requirements: 8.3
    """
    if wine_id < 0:
        raise ValueError("Wine ID must be non-negative")
    
    if wine_id > 9999999999:  # Max 10 digits
        raise ValueError("Wine ID too large for internal barcode format")
    
    # Format: INT + 10-digit zero-padded wine_id
    return f"INT{wine_id:010d}"


def detect_barcode_type(barcode: str) -> Optional[str]:
    """
    Detect the type of a barcode by trying all validators.
    
    Args:
        barcode: The barcode string to detect
        
    Returns:
        Barcode type string (EAN13, CODE128, INTERNAL, QR) or None if invalid
    """
    if not barcode or not isinstance(barcode, str):
        return None
    
    barcode = barcode.strip()
    
    # Check in order of specificity (most specific first)
    if validate_internal_barcode(barcode):
        return "INTERNAL"
    elif validate_ean13(barcode):
        return "EAN13"
    elif validate_qr_barcode(barcode):
        return "QR"
    elif validate_code128(barcode):
        return "CODE128"
    
    return None
