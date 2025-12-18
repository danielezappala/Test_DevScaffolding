"""
Unit and property-based tests for barcode validation utilities.

Tests barcode format validation and generation functions.
"""

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.utils.barcode import (
    detect_barcode_type,
    generate_internal_barcode,
    validate_barcode,
    validate_code128,
    validate_ean13,
    validate_internal_barcode,
    validate_qr_barcode,
)

# ===== Unit Tests =====

class TestEAN13Validation:
    """Unit tests for EAN-13 validation"""

    def test_valid_ean13(self):
        """Test valid EAN-13 barcodes"""
        # Valid EAN-13 with correct checksum
        assert validate_ean13("5901234123457") is True
        assert validate_ean13("4006381333931") is True
        assert validate_ean13("0000000000000") is True

    def test_invalid_ean13_length(self):
        """Test EAN-13 with wrong length"""
        assert validate_ean13("123") is False
        assert validate_ean13("12345678901234") is False
        assert validate_ean13("") is False

    def test_invalid_ean13_non_numeric(self):
        """Test EAN-13 with non-numeric characters"""
        assert validate_ean13("590123412345A") is False
        assert validate_ean13("590-234-12345") is False

    def test_invalid_ean13_checksum(self):
        """Test EAN-13 with invalid checksum"""
        assert validate_ean13("5901234123456") is False  # Wrong check digit


class TestCode128Validation:
    """Unit tests for Code128 validation"""

    def test_valid_code128(self):
        """Test valid Code128 barcodes"""
        assert validate_code128("ABC123") is True
        assert validate_code128("TEST-CODE.123") is True
        assert validate_code128("A") is True
        assert validate_code128("12345678901234567890") is True  # Max 20 chars

    def test_invalid_code128_length(self):
        """Test Code128 with invalid length"""
        assert validate_code128("") is False
        assert validate_code128("123456789012345678901") is False  # 21 chars

    def test_invalid_code128_characters(self):
        """Test Code128 with invalid characters"""
        assert validate_code128("ABC@123") is False
        assert validate_code128("TEST#CODE") is False


class TestInternalBarcodeValidation:
    """Unit tests for internal barcode validation"""

    def test_valid_internal_barcode(self):
        """Test valid internal barcodes"""
        assert validate_internal_barcode("INT0000000123") is True
        assert validate_internal_barcode("INT0000000001") is True
        assert validate_internal_barcode("INT9999999999") is True

    def test_invalid_internal_barcode_format(self):
        """Test internal barcode with wrong format"""
        assert validate_internal_barcode("INT123") is False
        assert validate_internal_barcode("INT00000000123") is False  # 11 digits
        assert validate_internal_barcode("int0000000123") is False  # lowercase
        assert validate_internal_barcode("IN0000000123") is False  # Missing T


class TestQRBarcodeValidation:
    """Unit tests for QR barcode validation"""

    def test_valid_qr_barcode(self):
        """Test valid QR barcodes"""
        assert validate_qr_barcode("ABC123") is True
        assert validate_qr_barcode("A") is True
        assert validate_qr_barcode("12345678901234567890") is True  # Max 20 chars

    def test_invalid_qr_barcode_length(self):
        """Test QR barcode with invalid length"""
        assert validate_qr_barcode("") is False
        assert validate_qr_barcode("123456789012345678901") is False  # 21 chars

    def test_invalid_qr_barcode_characters(self):
        """Test QR barcode with invalid characters"""
        assert validate_qr_barcode("ABC-123") is False
        assert validate_qr_barcode("TEST.CODE") is False
        assert validate_qr_barcode("ABC 123") is False


class TestGeneralBarcodeValidation:
    """Unit tests for general barcode validation"""

    def test_validate_barcode_with_type(self):
        """Test validation with specific type"""
        assert validate_barcode("5901234123457", "EAN13") is True
        assert validate_barcode("ABC123", "CODE128") is True
        assert validate_barcode("INT0000000123", "INTERNAL") is True
        assert validate_barcode("ABC123", "QR") is True

    def test_validate_barcode_without_type(self):
        """Test validation without type (tries all formats)"""
        assert validate_barcode("5901234123457") is True  # EAN13
        assert validate_barcode("ABC-123") is True  # CODE128
        assert validate_barcode("INT0000000123") is True  # INTERNAL
        assert validate_barcode("ABC123") is True  # Could be CODE128 or QR

    def test_validate_barcode_invalid(self):
        """Test validation with invalid barcodes"""
        assert validate_barcode("") is False
        assert validate_barcode(None) is False
        assert validate_barcode("@#$%") is False


class TestInternalBarcodeGeneration:
    """Unit tests for internal barcode generation"""

    def test_generate_internal_barcode(self):
        """Test internal barcode generation"""
        assert generate_internal_barcode(123) == "INT0000000123"
        assert generate_internal_barcode(1) == "INT0000000001"
        assert generate_internal_barcode(9999999999) == "INT9999999999"
        assert generate_internal_barcode(0) == "INT0000000000"

    def test_generate_internal_barcode_invalid_id(self):
        """Test internal barcode generation with invalid IDs"""
        with pytest.raises(ValueError):
            generate_internal_barcode(-1)

        with pytest.raises(ValueError):
            generate_internal_barcode(10000000000)  # Too large


class TestBarcodeTypeDetection:
    """Unit tests for barcode type detection"""

    def test_detect_barcode_type(self):
        """Test barcode type detection"""
        assert detect_barcode_type("INT0000000123") == "INTERNAL"
        assert detect_barcode_type("5901234123457") == "EAN13"
        assert detect_barcode_type("ABC123") == "QR"  # Alphanumeric, could be QR
        assert detect_barcode_type("ABC-123") == "CODE128"

    def test_detect_barcode_type_invalid(self):
        """Test type detection with invalid barcodes"""
        assert detect_barcode_type("") is None
        assert detect_barcode_type(None) is None
        assert detect_barcode_type("@#$%") is None


# ===== Property-Based Tests =====

# Strategy for generating valid EAN-13 barcodes
@st.composite
def ean13_strategy(draw):
    """Generate valid EAN-13 barcodes with correct checksum"""
    # Generate first 12 digits
    digits = [draw(st.integers(min_value=0, max_value=9)) for _ in range(12)]

    # Calculate checksum
    checksum = 0
    for i in range(12):
        if i % 2 == 0:
            checksum += digits[i]
        else:
            checksum += digits[i] * 3

    # Calculate check digit
    check_digit = (10 - (checksum % 10)) % 10
    digits.append(check_digit)

    return ''.join(str(d) for d in digits)


# Strategy for generating valid Code128 barcodes
code128_strategy = st.text(
    alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), min_codepoint=45, max_codepoint=122)
    .filter(lambda c: c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-. '),
    min_size=1,
    max_size=20
)


# Strategy for generating valid internal barcodes
@st.composite
def internal_barcode_strategy(draw):
    """Generate valid internal barcodes"""
    wine_id = draw(st.integers(min_value=0, max_value=9999999999))
    return f"INT{wine_id:010d}"


# Strategy for generating valid QR barcodes
qr_strategy = st.text(
    alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')),
    min_size=1,
    max_size=20
)


@pytest.mark.asyncio
@given(barcode=ean13_strategy())
@settings(max_examples=100, deadline=None)
async def test_barcode_format_validation_ean13_property(barcode):
    """
    **Feature: barcode-scanning, Property 6: Barcode Format Validation**
    **Validates: Requirements 9.1**

    Property: For any barcode string, if it passes validation, it must match one of the
    accepted formats (EAN-13, Code128, Internal, QR).

    This test verifies EAN-13 format validation:
    1. All generated EAN-13 barcodes pass validation
    2. EAN-13 validator correctly identifies valid barcodes
    3. Checksum validation works correctly
    """
    # All generated EAN-13 barcodes should be valid
    assert validate_ean13(barcode) is True, f"Generated EAN-13 {barcode} failed validation"

    # Should also pass general validation
    assert validate_barcode(barcode) is True, f"EAN-13 {barcode} failed general validation"

    # Should be detected as EAN13 type
    assert detect_barcode_type(barcode) == "EAN13", f"EAN-13 {barcode} not detected correctly"


@pytest.mark.asyncio
@given(barcode=code128_strategy)
@settings(max_examples=100, deadline=None)
async def test_barcode_format_validation_code128_property(barcode):
    """
    **Feature: barcode-scanning, Property 6: Barcode Format Validation**
    **Validates: Requirements 9.1**

    Property: For any barcode string, if it passes validation, it must match one of the
    accepted formats (EAN-13, Code128, Internal, QR).

    This test verifies Code128 format validation:
    1. All generated Code128 barcodes pass validation
    2. Code128 validator correctly identifies valid barcodes
    3. Character set validation works correctly
    """
    # All generated Code128 barcodes should be valid
    assert validate_code128(barcode) is True, f"Generated Code128 {barcode} failed validation"

    # Should also pass general validation
    assert validate_barcode(barcode) is True, f"Code128 {barcode} failed general validation"


@pytest.mark.asyncio
@given(barcode=internal_barcode_strategy())
@settings(max_examples=100, deadline=None)
async def test_barcode_format_validation_internal_property(barcode):
    """
    **Feature: barcode-scanning, Property 6: Barcode Format Validation**
    **Validates: Requirements 9.1**

    Property: For any barcode string, if it passes validation, it must match one of the
    accepted formats (EAN-13, Code128, Internal, QR).

    This test verifies Internal format validation:
    1. All generated internal barcodes pass validation
    2. Internal validator correctly identifies valid barcodes
    3. Format validation (INT + 10 digits) works correctly
    """
    # All generated internal barcodes should be valid
    assert validate_internal_barcode(barcode) is True, \
        f"Generated internal barcode {barcode} failed validation"

    # Should also pass general validation
    assert validate_barcode(barcode) is True, \
        f"Internal barcode {barcode} failed general validation"

    # Should be detected as INTERNAL type
    assert detect_barcode_type(barcode) == "INTERNAL", \
        f"Internal barcode {barcode} not detected correctly"


@pytest.mark.asyncio
@given(barcode=qr_strategy)
@settings(max_examples=100, deadline=None)
async def test_barcode_format_validation_qr_property(barcode):
    """
    **Feature: barcode-scanning, Property 6: Barcode Format Validation**
    **Validates: Requirements 9.1**

    Property: For any barcode string, if it passes validation, it must match one of the
    accepted formats (EAN-13, Code128, Internal, QR).

    This test verifies QR format validation:
    1. All generated QR barcodes pass validation
    2. QR validator correctly identifies valid barcodes
    3. Alphanumeric validation works correctly
    """
    # All generated QR barcodes should be valid
    assert validate_qr_barcode(barcode) is True, f"Generated QR {barcode} failed validation"

    # Should also pass general validation
    assert validate_barcode(barcode) is True, f"QR {barcode} failed general validation"


@pytest.mark.asyncio
@given(
    barcode_type=st.sampled_from(["EAN13", "CODE128", "INTERNAL", "QR"]),
    valid_barcode=st.one_of(
        ean13_strategy(),
        code128_strategy,
        internal_barcode_strategy(),
        qr_strategy
    )
)
@settings(max_examples=100, deadline=None)
async def test_barcode_validation_consistency_property(barcode_type, valid_barcode):
    """
    **Feature: barcode-scanning, Property 6: Barcode Format Validation**
    **Validates: Requirements 9.1**

    Property: For any valid barcode, the validation function should consistently
    return the same result regardless of how many times it's called.

    This test verifies validation consistency:
    1. Multiple validations of the same barcode return the same result
    2. Validation is deterministic
    3. No side effects from validation
    """
    # Validate the barcode multiple times
    results = [validate_barcode(valid_barcode) for _ in range(5)]

    # All results should be the same
    assert all(r == results[0] for r in results), \
        f"Validation of {valid_barcode} returned inconsistent results: {results}"

    # At least one format should accept it
    assert results[0] is True, \
        f"Valid barcode {valid_barcode} was rejected by all validators"



@pytest.mark.asyncio
@given(wine_id=st.integers(min_value=0, max_value=9999999999))
@settings(max_examples=100, deadline=None)
async def test_internal_barcode_generation_uniqueness_property(wine_id):
    """
    **Feature: barcode-scanning, Property 7: Internal Barcode Generation Uniqueness**
    **Validates: Requirements 8.3**

    Property: For any wine without a barcode, generating an internal barcode should
    produce a unique code that doesn't conflict with existing barcodes.

    This test verifies internal barcode generation:
    1. Generated barcode follows the correct format (INT + 10 digits)
    2. Generated barcode is valid according to internal barcode validator
    3. Same wine_id always generates the same barcode (deterministic)
    4. Different wine_ids generate different barcodes (uniqueness)
    """
    # Generate internal barcode
    barcode = generate_internal_barcode(wine_id)

    # Verify format: INT followed by 10 digits (total 13 characters)
    assert len(barcode) == 13, f"Internal barcode {barcode} should be 13 characters"
    assert barcode.startswith("INT"), f"Internal barcode {barcode} should start with INT"
    assert barcode[3:].isdigit(), f"Internal barcode {barcode} should have 10 digits after INT"

    # Verify it passes internal barcode validation
    assert validate_internal_barcode(barcode) is True, \
        f"Generated internal barcode {barcode} failed validation"

    # Verify determinism: same wine_id generates same barcode
    barcode2 = generate_internal_barcode(wine_id)
    assert barcode == barcode2, \
        f"Same wine_id {wine_id} generated different barcodes: {barcode} vs {barcode2}"

    # Verify uniqueness: different wine_ids generate different barcodes
    if wine_id < 9999999999:  # Only test if we can increment
        different_barcode = generate_internal_barcode(wine_id + 1)
        assert barcode != different_barcode, \
            f"Different wine_ids generated same barcode: {barcode}"


@pytest.mark.asyncio
@given(
    wine_ids=st.lists(
        st.integers(min_value=0, max_value=9999999999),
        min_size=2,
        max_size=10,
        unique=True
    )
)
@settings(max_examples=100, deadline=None)
async def test_internal_barcode_generation_collision_property(wine_ids):
    """
    **Feature: barcode-scanning, Property 7: Internal Barcode Generation Uniqueness**
    **Validates: Requirements 8.3**

    Property: For any set of different wine IDs, the generated internal barcodes
    must all be unique (no collisions).

    This test verifies:
    1. Multiple wine IDs generate unique barcodes
    2. No collisions occur in barcode generation
    3. The generation function is injective (one-to-one mapping)
    """
    # Generate barcodes for all wine IDs
    barcodes = [generate_internal_barcode(wine_id) for wine_id in wine_ids]

    # Verify all barcodes are unique (no duplicates)
    assert len(barcodes) == len(set(barcodes)), \
        f"Collision detected! Generated barcodes: {barcodes}"

    # Verify each barcode is valid
    for barcode in barcodes:
        assert validate_internal_barcode(barcode) is True, \
            f"Generated barcode {barcode} is invalid"

    # Verify mapping is correct: each wine_id maps to its expected barcode
    for wine_id, barcode in zip(wine_ids, barcodes, strict=True):
        expected = f"INT{wine_id:010d}"
        assert barcode == expected, \
            f"Wine ID {wine_id} generated {barcode}, expected {expected}"
