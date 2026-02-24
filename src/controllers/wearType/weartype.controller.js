import ProductWearType from "../../models/productTypeModal.js";

export const createWearType = async (req, res) => {
    try {
        const { name, icon, displayOrder, showInMenu, isActive } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const existing = await ProductWearType.findOne({ name: name.trim() });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Wear type already exists"
            });
        }

        const wearType = await ProductWearType.create({
            name: name.trim(),
            icon: icon || "",
            displayOrder: displayOrder ?? 0,
            showInMenu: showInMenu ?? true,
            isActive: isActive ?? true
        });

        res.status(201).json({
            success: true,
            message: "Wear type created successfully",
            data: wearType
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};





export const getWearTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      name: { $regex: search, $options: "i" }
    };

    const data = await ProductWearType.find(query)
      .sort({ displayOrder: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ProductWearType.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWearTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Id is required" });
    }

    const wearType = await ProductWearType.findById(id);

    if (!wearType) {
      return res.status(404).json({ success: false, message: "Wear type not found" });
    }

    res.status(200).json({ success: true, data: wearType });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateWearType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Id is required" });
    }

    const existing = await ProductWearType.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Wear type not found" });
    }

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    const updated = await ProductWearType.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Wear type updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWearType = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ProductWearType.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Wear type not found" });
    }

    res.status(200).json({
      success: true,
      message: "Wear type deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};